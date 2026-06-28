// Input dari form multi-step
export interface CreateBookingInput {
  // Step 1: Kendaraan & Tanggal
  vehicleId: string;
  startDate: string;          // ISO: "2025-07-01T08:00:00.000Z"
  endDate: string;            // ISO: "2025-07-04T08:00:00.000Z"
  
  // Step 2: Metode Pengambilan
  pickupMethod: 'SELF_PICKUP' | 'DELIVERY';
  deliveryAddress?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  
  // Step 3: Layanan Tambahan
  addons: {
    type: 'DRIVER' | 'CHILD_SEAT' | 'EXTRA_INSURANCE' | 'GPS_DEVICE' | 'FULL_TANK';
    quantity: number;         // biasanya 1
  }[];
  
  // Step 4: Kontak Darurat
  emergencyContacts: {
    name: string;
    phone: string;
    relationship: 'FAMILY' | 'SPOUSE' | 'FRIEND' | 'COLLEAGUE';
    order: 1 | 2;
  }[];
  
  // Step 5: Voucher (opsional)
  voucherCode?: string;
  
  // Step 6: Tanda Tangan Digital
  renterSignature: string;    // base64 signature
  
  // Step 7: Persetujuan
  agreeToTerms: boolean;
  agreeToDepositPolicy: boolean;
}

// Kalkulasi harga
export interface BookingPriceBreakdown {
  // Komponen harga dasar
  dailyRate: number;          // tarif per hari
  totalDays: number;          // jumlah hari
  baseAmount: number;         // dailyRate × totalDays
  
  // Diskon
  weeklyDiscount: number;     // diskon jika >= 7 hari
  monthlyDiscount: number;    // diskon jika >= 30 hari
  voucherDiscount: number;    // diskon voucher
  totalDiscount: number;      // total semua diskon
  
  // Tambahan
  driverCost: number;         // biaya sopir (jika ada)
  addonCost: number;          // total biaya addon lain
  deliveryCost: number;       // biaya antar (jika ada)
  
  // Platform
  subtotal: number;           // setelah diskon
  platformFee: number;        // 10% dari subtotal
  
  // Deposit
  depositAmount: number;      // 30% dari subtotal
  
  // Final
  totalPayment: number;       // subtotal + platformFee
  grandTotal: number;         // totalPayment + deposit
  
  // Metadata
  appliedVoucher: string | null;
  weekendDays: number;        // berapa hari weekend
  weekdayDays: number;        // berapa hari weekday
}

// Response sukses
export interface CreateBookingResponse {
  success: true;
  data: {
    bookingId: string;
    bookingCode: string;        // format: RR-20250701-AB123
    snapToken: string;          // Midtrans Snap token
    paymentUrl: string;         // Midtrans payment URL
    expiresAt: string;          // batas waktu bayar
    priceBreakdown: BookingPriceBreakdown;
    vehicleName: string;
    pickupDateTime: string;
    returnDateTime: string;
  };
}

// Response error
export interface CreateBookingError {
  success: false;
  errorCode: 
    | 'VALIDATION_ERROR'
    | 'UNAUTHORIZED'
    | 'KYC_NOT_VERIFIED'
    | 'KYC_EXPIRED'
    | 'VEHICLE_NOT_FOUND'
    | 'VEHICLE_NOT_AVAILABLE'
    | 'SCHEDULE_CONFLICT'      // ← race condition tertangkap
    | 'VEHICLE_INACTIVE'
    | 'INVALID_DATES'
    | 'VOUCHER_INVALID'
    | 'VOUCHER_EXPIRED'
    | 'VOUCHER_DEPLETED'
    | 'PAYMENT_INIT_FAILED'
    | 'SELF_BOOKING'           // owner tidak bisa sewa sendiri
    | 'TRANSACTION_FAILED'
    | 'RATE_LIMITED';
  errorMessage: string;         // dalam Bahasa Indonesia
  details?: Record<string, string[]>;  // field-level errors
  retryable: boolean;           // apakah bisa coba lagi
}

export type CreateBookingResult = CreateBookingResponse | CreateBookingError;
