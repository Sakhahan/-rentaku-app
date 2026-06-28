import { Decimal } from "decimal.js";
import { BookingPriceBreakdown } from "../../types/booking";

interface CalculatePriceParams {
  vehicle: {
    dailyRate: number | string | Decimal | any;
    weekendRate: number | string | Decimal | any | null;
    weeklyDiscount: number | null;    // persentase, contoh: 10
    monthlyDiscount: number | null;   // persentase, contoh: 20
    includesDriver: boolean;
    driverDailyRate: number | string | Decimal | any | null;
    deliveryAvailable: boolean;
    deliveryCostPerKm: number | string | Decimal | any | null;
  };
  startDate: Date;
  endDate: Date;
  addons: { type: string; quantity: number }[];
  deliveryDistanceKm?: number;
  voucher?: {
    type: "PERCENTAGE" | "FIXED_AMOUNT";
    value: number | string | Decimal | any;
    maxDiscountAmount: number | string | Decimal | any | null;
    minBookingAmount: number | string | Decimal | any | null;
  } | null;
  platformFeePercentage: number;      // dari PlatformSetting (10)
  depositPercentage: number;          // dari PlatformSetting (30)
}

/**
 * Membulatkan nilai ke kelipatan 100 terdekat.
 */
function roundToNearest100(val: Decimal): number {
  return Math.round(val.toNumber() / 100) * 100;
}

/**
 * Menghitung breakdown harga sewa kendaraan secara akurat lambat mengadopsi floating point error.
 * Fungsi ini deterministik dan dapat digunakan di frontend maupun backend.
 */
export function calculateBookingPrice(params: CalculatePriceParams): BookingPriceBreakdown {
  const {
    vehicle,
    startDate,
    endDate,
    addons,
    deliveryDistanceKm = 0,
    voucher,
    platformFeePercentage,
    depositPercentage
  } = params;

  const startMs = startDate.getTime();
  const endMs = endDate.getTime();
  
  if (endMs <= startMs) {
    throw new Error("Tanggal akhir sewa harus setelah tanggal mulai sewa");
  }

  // 1. Hitung totalDays (dibulatkan ke atas)
  const diffHours = (endMs - startMs) / (1000 * 60 * 60);
  const totalDays = Math.ceil(diffHours / 24);

  // 2. Pisahkan hari weekday vs weekend
  let weekendDays = 0;
  let weekdayDays = 0;
  
  // Menggunakan tanggal lokal/UTC aman
  const current = new Date(startMs);
  for (let i = 0; i < totalDays; i++) {
    const dayOfWeek = current.getUTCDay(); // 0 is Sunday, 6 is Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendDays++;
    } else {
      weekdayDays++;
    }
    // Increment current by 24 hours
    current.setUTCDate(current.getUTCDate() + 1);
  }

  // Rates in Decimal
  const dailyRateDec = new Decimal(vehicle.dailyRate.toString());
  const weekendRateDec = vehicle.weekendRate ? new Decimal(vehicle.weekendRate.toString()) : dailyRateDec;

  // 3. baseAmount = weekdayDays * dailyRate + weekendDays * weekendRate
  const baseAmountDec = dailyRateDec.mul(weekdayDays).add(weekendRateDec.mul(weekendDays));
  const baseAmount = roundToNearest100(baseAmountDec);

  // 4. Hitung diskon durasi (weeklyDiscount jika >= 7 hari, monthlyDiscount jika >= 30 hari)
  let discountPercentage = 0;
  let weeklyDiscount = 0;
  let monthlyDiscount = 0;

  if (totalDays >= 30 && vehicle.monthlyDiscount !== null) {
    discountPercentage = vehicle.monthlyDiscount;
    monthlyDiscount = discountPercentage;
  } else if (totalDays >= 7 && vehicle.weeklyDiscount !== null) {
    discountPercentage = vehicle.weeklyDiscount;
    weeklyDiscount = discountPercentage;
  }

  const discountDurationDec = baseAmountDec.mul(discountPercentage).div(100);
  const totalDiscountDuration = roundToNearest100(discountDurationDec);

  // 5. Hitung addon costs:
  //    DRIVER: driverDailyRate × totalDays
  //    CHILD_SEAT: 50.000 × totalDays
  //    EXTRA_INSURANCE: 75.000 × totalDays  
  //    GPS_DEVICE: 35.000 × totalDays
  //    FULL_TANK: 150.000 (flat, bukan per hari)
  let driverCost = 0;
  let totalAddonDec = new Decimal(0);

  addons.forEach(addon => {
    let addonPrice = new Decimal(0);
    if (addon.type === "DRIVER") {
      const driverDailyDec = vehicle.driverDailyRate ? new Decimal(vehicle.driverDailyRate.toString()) : new Decimal(150000); // fallback if null
      addonPrice = driverDailyDec.mul(totalDays);
      driverCost = roundToNearest100(addonPrice);
    } else if (addon.type === "CHILD_SEAT") {
      addonPrice = new Decimal(50000).mul(totalDays).mul(addon.quantity);
    } else if (addon.type === "EXTRA_INSURANCE") {
      addonPrice = new Decimal(75000).mul(totalDays).mul(addon.quantity);
    } else if (addon.type === "GPS_DEVICE") {
      addonPrice = new Decimal(35000).mul(totalDays).mul(addon.quantity);
    } else if (addon.type === "FULL_TANK") {
      addonPrice = new Decimal(150000).mul(addon.quantity); // Flat
    }
    
    if (addon.type !== "DRIVER") {
      totalAddonDec = totalAddonDec.add(addonPrice);
    }
  });

  const addonCost = roundToNearest100(totalAddonDec);

  // 6. deliveryCost = deliveryDistanceKm × deliveryCostPerKm (jika DELIVERY dan deliveryAvailable)
  let deliveryCost = 0;
  if (vehicle.deliveryAvailable && vehicle.deliveryCostPerKm && deliveryDistanceKm > 0) {
    const deliveryCostPerKmDec = new Decimal(vehicle.deliveryCostPerKm.toString());
    const deliveryCostDec = deliveryCostPerKmDec.mul(deliveryDistanceKm);
    deliveryCost = roundToNearest100(deliveryCostDec);
  }

  // 7. subtotalSebelumVoucher
  const subtotalBeforeVoucherDec = baseAmountDec
    .sub(discountDurationDec)
    .add(driverCost)
    .add(totalAddonDec)
    .add(deliveryCost);

  // 8. Hitung diskon voucher
  let voucherDiscount = 0;
  let appliedVoucherCode: string | null = null;

  if (voucher) {
    const minBookingAmt = voucher.minBookingAmount ? new Decimal(voucher.minBookingAmount.toString()) : new Decimal(0);
    
    // Cek apakah minimal order terpenuhi
    if (subtotalBeforeVoucherDec.gte(minBookingAmt)) {
      const voucherValDec = new Decimal(voucher.value.toString());
      let voucherDiscountDec = new Decimal(0);

      if (voucher.type === "PERCENTAGE") {
        voucherDiscountDec = subtotalBeforeVoucherDec.mul(voucherValDec).div(100);
        if (voucher.maxDiscountAmount) {
          const maxDiscDec = new Decimal(voucher.maxDiscountAmount.toString());
          if (voucherDiscountDec.gt(maxDiscDec)) {
            voucherDiscountDec = maxDiscDec;
          }
        }
      } else if (voucher.type === "FIXED_AMOUNT") {
        voucherDiscountDec = Decimal.min(voucherValDec, subtotalBeforeVoucherDec);
      }

      voucherDiscount = roundToNearest100(voucherDiscountDec);
    }
  }

  const totalDiscount = roundToNearest100(new Decimal(totalDiscountDuration).add(voucherDiscount));

  // 9. subtotal setelah diskon voucher
  const subtotalDec = Decimal.max(0, subtotalBeforeVoucherDec.sub(voucherDiscount));
  const subtotal = roundToNearest100(subtotalDec);

  // 10. platformFee
  const platformFeeDec = subtotalDec.mul(platformFeePercentage).div(100);
  const platformFee = roundToNearest100(platformFeeDec);

  // 11. depositAmount
  const depositAmountDec = subtotalDec.mul(depositPercentage).div(100);
  const depositAmount = roundToNearest100(depositAmountDec);

  // 12. totalPayment & grandTotal
  const totalPaymentDec = subtotalDec.add(platformFeeDec);
  const totalPayment = roundToNearest100(totalPaymentDec);

  const grandTotalDec = totalPaymentDec.add(depositAmountDec);
  const grandTotal = roundToNearest100(grandTotalDec);

  return {
    dailyRate: Number(vehicle.dailyRate),
    totalDays,
    baseAmount,
    weeklyDiscount,
    monthlyDiscount,
    voucherDiscount,
    totalDiscount,
    driverCost,
    addonCost,
    deliveryCost,
    subtotal,
    platformFee,
    depositAmount,
    totalPayment,
    grandTotal,
    appliedVoucher: voucher ? "Voucher Active" : null,
    weekendDays,
    weekdayDays
  };
}
