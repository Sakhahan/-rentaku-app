"use server";

import { prisma } from "../../lib/prisma";
import { CreateBookingInput, CreateBookingResult } from "../../types/booking";
import { BookingError, handleBookingError } from "../../lib/errors/booking";
import { calculateBookingPrice } from "../../lib/booking/price-calc";
import { generateUniqueBookingCode } from "../../lib/booking/code-gen";
import { createSnapToken } from "../../lib/payment/midtrans";
import { createBookingSchema } from "../../lib/validations/booking";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

// In-Memory Rate Limiter Map (Max 5 attempts per user per 10 minutes)
const rateLimitMap = new Map<string, { attempts: number; resetTime: number }>();

/**
 * Melakukan pemeriksaan batas pemanggilan API (rate limiting) untuk menghindari pemboman pemesanan.
 */
function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const limitKey = `booking_attempt:${userId}`;
  const record = rateLimitMap.get(limitKey);

  if (!record) {
    rateLimitMap.set(limitKey, { attempts: 1, resetTime: now + 10 * 60 * 1000 });
    return false;
  }

  if (now > record.resetTime) {
    rateLimitMap.set(limitKey, { attempts: 1, resetTime: now + 10 * 60 * 1000 });
    return false;
  }

  if (record.attempts >= 5) {
    return true;
  }

  record.attempts += 1;
  return false;
}

/**
 * Menghitung harga per hari addon secara lokal.
 */
function getAddonPricePerDay(type: string, driverDailyRate: number): number {
  if (type === "DRIVER") return driverDailyRate;
  if (type === "CHILD_SEAT") return 50000;
  if (type === "EXTRA_INSURANCE") return 75000;
  if (type === "GPS_DEVICE") return 35000;
  if (type === "FULL_TANK") return 150000; // Flat
  return 0;
}

/**
 * Menghitung harga total addon secara lokal.
 */
function getAddonTotalPrice(type: string, totalDays: number, driverDailyRate: number): number {
  const rate = getAddonPricePerDay(type, driverDailyRate);
  if (type === "FULL_TANK") return rate; // flat
  return rate * totalDays;
}

/**
 * Menghapus segala karakter non-digit dan menormalisasikan awalan nomor HP Indonesia menjadi 62.
 */
function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Membuat draf Surat Perjanjian Sewa Digital (Rental Agreement).
 */
function generateAgreementContent(params: {
  bookingCode: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  baseAmount: number;
  addonAmount: number;
  deliveryCost: number;
  discountAmount: number;
  platformFee: number;
  depositAmount: number;
  totalAmount: number;
  grandTotal: number;
  vehicle: any;
  renterName: string;
  renterEmail: string;
}): string {
  return `### RENTRIDE RENTAL AGREEMENT
Kode Transaksi: ${params.bookingCode}
Tanggal Dokumen: ${new Date().toLocaleDateString("id-ID")}

Pihak Pertama (Penyewa / Renter):
- Nama Lengkap: ${params.renterName}
- Email: ${params.renterEmail}

Pihak Kedua (Pemilik Rental / RentRide Partner):
- Nama Pemilik: ${params.vehicle.owner_name || "Mitra RentRide"}

Detail Unit Kendaraan:
- Unit: ${params.vehicle.brand} ${params.vehicle.model} (${params.vehicle.year})
- Nomor Polisi: ${params.vehicle.licensePlate}

Periode Sewa-Menyewa:
- Lokasi Mulai: ${params.vehicle.pickupAddress}
- Waktu Mulai: ${params.startDate.toLocaleString("id-ID")}
- Waktu Pengembalian: ${params.endDate.toLocaleString("id-ID")}
- Total Durasi: ${params.totalDays} Hari Kalender

Rincian Transaksi Pembayaran:
- Biaya Tarif Dasar Sewa: Rp ${params.baseAmount.toLocaleString("id-ID")}
- Biaya Layanan Tambahan (Addon): Rp ${params.addonAmount.toLocaleString("id-ID")}
- Biaya Pengantaran/Penjemputan: Rp ${params.deliveryCost.toLocaleString("id-ID")}
- Potongan Diskon Promosi: -Rp ${params.discountAmount.toLocaleString("id-ID")}
- Biaya Administrasi Platform (10%): Rp ${params.platformFee.toLocaleString("id-ID")}
- Biaya Jaminan Keamanan (Deposit): Rp ${params.depositAmount.toLocaleString("id-ID")}
- Total Pelunasan Sewa: Rp ${params.totalAmount.toLocaleString("id-ID")}
- Grand Total (Termasuk Deposit): Rp ${params.grandTotal.toLocaleString("id-ID")}

SYARAT & KETENTUAN UTAMA:
1. Penyewa menyatakan memiliki SIM yang sah, sah, dan sah menurut peraturan perundang-undangan di Indonesia demi keselamatan umum.
2. Penyewa bertanggung jawab secara eksklusif atas segala kerusakan fisik, baret, lecet, penyok, kehilangan komponen, denda e-tilang, kecelakaan lalu lintas, ataupun kelalaian dalam bentuk apa pun selama periode sewa aktif.
3. Jaminan keamanan (Deposit) sebesar Rp ${params.depositAmount.toLocaleString("id-ID")} ditahan dengan aman oleh sistem RentRide dan akan diproses dan dikembalikan utuh paling lambat 1-3 hari kerja setelah penyerahan balik unit divalidasi tanpa masalah kerusakan.
4. Tanda tangan digital yang dibubuhkan pada dokumen ini memiliki kekuatan pembuktian yang mengikat secara sah demi hukum perdata Indonesia.`;
}

/**
 * Notifikasi WhatsApp Mock
 */
async function sendWhatsApp(phone: string, template: string, data: any) {
  console.log(`[WhatsApp HUD] Terkirim pesan WA ke ${phone} [Template: ${template}]. Data:`, JSON.stringify(data));
}

/**
 * Notifikasi Email Mock
 */
async function sendEmail(email: string, template: string, data: any) {
  console.log(`[Email HUD] Terkirim email ke ${email} [Template: ${template}]. Data:`, JSON.stringify(data));
}

/**
 * Server Action utama untuk memproses pembuatan sewa kendaraan (Create Booking)
 * dengan benteng proteksi Race Condition menggunakan Prisma Interactive Transactions & Serializable Isolation Level.
 */
export async function createBookingAction(input: CreateBookingInput): Promise<CreateBookingResult> {
  const startTime = performance.now();

  try {
    // ═══════════════════════════════════════
    // STEP 2: AUTENTIKASI SESSION
    // ═══════════════════════════════════════
    let sessionUserId = "";
    let sessionUserEmail = "";
    let sessionUserFullName = "";

    try {
      const session = await getServerSession();
      if (session?.user) {
        // @ts-ignore
        sessionUserId = session.user.id || "";
        sessionUserEmail = session.user.email || "";
        // @ts-ignore
        sessionUserFullName = session.user.fullName || session.user.name || "";
      }
    } catch (authError) {
      console.warn("[Auth] Gagal mengekstrak session via NextAuth:", authError);
    }

    // Fallback Developer Mode untuk mempermudah luring preview & pengujian otomatis
    if (!sessionUserId) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[Auth] Menggunakan mock session untuk lokal development.");
        sessionUserId = process.env.DEV_USER_ID || "user-renter-1"; // Dummy renter
        sessionUserEmail = "syakhahanan1045@gmail.com";
        sessionUserFullName = "Sya Khahanan (Mock Developer)";
      } else {
        throw new BookingError("UNAUTHORIZED", "Sesi login Anda telah berakhir. Silakan masuk kembali.", false);
      }
    }

    // ═══════════════════════════════════════
    // STEP 1: RATE LIMITING
    // ═══════════════════════════════════════
    if (isRateLimited(sessionUserId)) {
      throw new BookingError("RATE_LIMITED", "Anda melakukan terlalu banyak upaya pemesanan dalam waktu singkat. Silakan tunggu 10 menit sebelum mencoba lagi.", false);
    }

    // ═══════════════════════════════════════
    // STEP 3: VALIDASI INPUT ZOD
    // ═══════════════════════════════════════
    const validationResult = createBookingSchema.safeParse(input);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      validationResult.error.issues.forEach((err) => {
        const path = err.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(err.message);
      });

      throw new BookingError(
        "VALIDATION_ERROR",
        "Form data pemesanan yang Anda masukkan tidak valid. Silakan periksa kembali bagian yang ditandai merah.",
        false,
        fieldErrors
      );
    }

    const validatedInput = validationResult.data;
    const startDate = new Date(validatedInput.startDate);
    const endDate = new Date(validatedInput.endDate);

    // ═══════════════════════════════════════
    // STEP 4: VALIDASI KYC PENYEWA
    // ═══════════════════════════════════════
    const kyc = await prisma.kycDocument.findUnique({
      where: { userId: sessionUserId },
    });

    if (!kyc || kyc.status !== "VERIFIED") {
      throw new BookingError(
        "KYC_NOT_VERIFIED",
        "Akun Anda belum terverifikasi KYC. Selesaikan verifikasi kartu identitas (KTP) dan kelayakan swafoto Anda terlebih dahulu untuk mulai menyewa.",
        false
      );
    }

    if (kyc.expiresAt && new Date(kyc.expiresAt) < new Date()) {
      throw new BookingError(
        "KYC_EXPIRED",
        "Masa berlaku kartu identitas / dokumen berkendara KYC Anda telah habis. Harap perbarui dokumen Anda terlebih dahulu.",
        false
      );
    }

    // ═══════════════════════════════════════
    // STEP 5: DATABASE TRANSACTION DENGAN LOCKING
    // ═══════════════════════════════════════
    const txResult = await prisma.$transaction(
      async (tx) => {
        // ─────────────────────────────────
        // 5A: SELECT FOR UPDATE — KUNCI BARIS KENDARAAN (Anti Race-Condition)
        // ─────────────────────────────────
        const sqlQuery = Prisma.sql`
          SELECT 
            v.*,
            u.full_name as "owner_name",
            u.id as "owner_id"
          FROM vehicles v
          JOIN users u ON u.id = v.owner_id
          WHERE v.id = ${validatedInput.vehicleId}
            AND v.deleted_at IS NULL
          FOR UPDATE
        `;

        const lockedVehicles = await tx.$queryRaw<any[]>(sqlQuery);
        const lockedVehicle = lockedVehicles[0];

        if (!lockedVehicle) {
          throw new BookingError("VEHICLE_NOT_FOUND", "Kendaraan yang Anda pilih tidak ditemukan atau telah dihapus oleh pemilik.", false);
        }

        // ─────────────────────────────────
        // 5B: VALIDASI KONDISI VEHICLE
        // ─────────────────────────────────
        if (lockedVehicle.status !== "ACTIVE") {
          throw new BookingError("VEHICLE_INACTIVE", "Kendaraan sewa ini sedang tidak aktif atau sedang memasuki masa perawatan berkala.", false);
        }

        if (lockedVehicle.owner_id === sessionUserId) {
          throw new BookingError("SELF_BOOKING", "Pemilik kendaraan dilarang keras membooking atau menyewa armadanya sendiri untuk menghindari penipuan rating.", false);
        }

        // Cek SIM tipe kelayakan berkendara
        const simType = kyc.simType;
        const vehicleType = lockedVehicle.type; // CAR atau MOTORCYCLE

        if (vehicleType === "CAR") {
          if (!["SIM_A", "SIM_B1", "SIM_B2"].includes(simType)) {
            throw new BookingError("KYC_NOT_VERIFIED", "Untuk menyewa Mobil, Anda wajib memiliki lisensi berkendara tipe SIM A, SIM B1, atau SIM B2.", false);
          }
        } else if (vehicleType === "MOTORCYCLE") {
          if (!["SIM_C", "SIM_A"].includes(simType)) { // SIM C standard, allow SIM A as well jika fallback
            throw new BookingError("KYC_NOT_VERIFIED", "Untuk menyewa Motor, Anda wajib memiliki lisensi berkendara tipe SIM C.", false);
          }
        }

        // ─────────────────────────────────
        // 5C: CEK KONFLIK JADWAL (OVERLAP DETECTION)
        // ─────────────────────────────────
        const conflictQuery = Prisma.sql`
          SELECT 
            vab.id,
            vab.start_date as "start_date",
            vab.end_date as "end_date",
            vab.reason
          FROM vehicle_availability_blocks vab
          WHERE vab.vehicle_id = ${validatedInput.vehicleId}
            AND vab.start_date < ${endDate}::timestamptz
            AND vab.end_date > ${startDate}::timestamptz
          LIMIT 1
          FOR SHARE
        `;

        const conflictingBlocks = await tx.$queryRaw<any[]>(conflictQuery);

        if (conflictingBlocks.length > 0) {
          const conflict = conflictingBlocks[0];
          const fmtStart = new Date(conflict.start_date).toLocaleDateString("id-ID", { dateStyle: "medium" });
          const fmtEnd = new Date(conflict.end_date).toLocaleDateString("id-ID", { dateStyle: "medium" });
          throw new BookingError(
            "SCHEDULE_CONFLICT",
            `Kendaraan ini sudah dipesan/diblokir oleh pelanggan lain pada periode ${fmtStart} hingga ${fmtEnd}. Silakan pilih periode tanggal sewa lainnya.`,
            true // retryable karena tanggal lain mungkin kosong
          );
        }

        // ─────────────────────────────────
        // 5D: HITUNG DETAIL BREAKDOWN HARGA
        // ─────────────────────────────────
        const settings = await tx.platformSetting.findMany({
          where: {
            key: { in: ["platform_fee_percentage", "deposit_percentage"] }
          }
        });

        const platformFeePercentage = Number(
          settings.find(s => s.key === "platform_fee_percentage")?.value ?? 10
        );
        const depositPercentage = Number(
          settings.find(s => s.key === "deposit_percentage")?.value ?? 30
        );

        // Cari tahu detail voucher jika diinputkan
        let validatedVoucher = null;
        if (validatedInput.voucherCode) {
          // ─────────────────────────────────
          // 5E: LOCK VOUCHER BARIS (Anti Race-Condition pada Voucher Limit)
          // ─────────────────────────────────
          const voucherQuery = Prisma.sql`
            SELECT * FROM vouchers
            WHERE code = ${validatedInput.voucherCode}
              AND status = 'ACTIVE'
              AND valid_from <= NOW()
              AND valid_until >= NOW()
            FOR UPDATE
          `;
          
          const lockedVouchers = await tx.$queryRaw<any[]>(voucherQuery);
          validatedVoucher = lockedVouchers[0];

          if (!validatedVoucher) {
            throw new BookingError("VOUCHER_INVALID", "Kode voucher tidak valid, tidak aktif, atau telah kadaluarsa.", false);
          }

          if (validatedVoucher.usage_limit !== null && validatedVoucher.usage_count >= validatedVoucher.usage_limit) {
            throw new BookingError("VOUCHER_DEPLETED", "Voucher promosi ini sudah mencapai kuota batas penukaran maksimal.", false);
          }
        }

        // Menghitung jarak delivery (dummy, jika DELIVERY default assume 10km atau hitung koordinat)
        let deliveryDistanceKm = 0;
        if (validatedInput.pickupMethod === "DELIVERY") {
          deliveryDistanceKm = 12; // Standard nominal distance calculation mock
        }

        const priceBreakdown = calculateBookingPrice({
          vehicle: lockedVehicle,
          startDate,
          endDate,
          addons: validatedInput.addons,
          deliveryDistanceKm,
          voucher: validatedVoucher,
          platformFeePercentage,
          depositPercentage
        });

        if (validatedVoucher) {
          const minBookingAmt = validatedVoucher.min_booking_amount ? Number(validatedVoucher.min_booking_amount) : 0;
          if (priceBreakdown.subtotal < minBookingAmt) {
            throw new BookingError(
              "VOUCHER_INVALID",
              `Total pembelanjaan sebelum diskon minimum Rp ${minBookingAmt.toLocaleString("id-ID")} diperlukan untuk menggunakan voucher ini.`,
              false
            );
          }

          // Increment usage count secara aman
          await tx.$executeRaw`
            UPDATE vouchers 
            SET usage_count = usage_count + 1
            WHERE id = ${validatedVoucher.id}
          `;
        }

        // ─────────────────────────────────
        // 5F: GENERATE BOOKING CODE UNIK
        // ─────────────────────────────────
        const bookingCode = await generateUniqueBookingCode(tx);

        // ─────────────────────────────────
        // 5G: CREATE RECORDS DALAM SATU TRASAKSI ATOMIK
        // ─────────────────────────────────
        
        // 1. Buat Booking record
        const booking = await tx.booking.create({
          data: {
            bookingCode,
            renterId: sessionUserId,
            vehicleId: validatedInput.vehicleId,
            startDate,
            endDate,
            totalDays: priceBreakdown.totalDays,
            withDriver: validatedInput.addons.some(a => a.type === "DRIVER"),
            pickupMethod: validatedInput.pickupMethod,
            deliveryAddress: validatedInput.deliveryAddress || null,
            deliveryLatitude: validatedInput.deliveryLatitude || null,
            deliveryLongitude: validatedInput.deliveryLongitude || null,
            deliveryCost: priceBreakdown.deliveryCost,
            baseAmount: priceBreakdown.baseAmount,
            addonAmount: priceBreakdown.addonCost,
            discountAmount: priceBreakdown.totalDiscount,
            platformFee: priceBreakdown.platformFee,
            depositAmount: priceBreakdown.depositAmount,
            totalAmount: priceBreakdown.totalPayment,
            voucherCode: validatedInput.voucherCode || null,
            status: "PENDING_PAYMENT",
          }
        });

        // 2. Buat BookingAddons (jika ada)
        if (validatedInput.addons.length > 0) {
          const driverDailyRate = lockedVehicle.driverDailyRate ? Number(lockedVehicle.driverDailyRate) : 150000;
          await tx.bookingAddon.createMany({
            data: validatedInput.addons.map((addon) => ({
              bookingId: booking.id,
              name: addon.type,
              pricePerDay: getAddonPricePerDay(addon.type, driverDailyRate),
              totalPrice: getAddonTotalPrice(addon.type, priceBreakdown.totalDays, driverDailyRate),
            })),
          });
        }

        // 3. Buat EmergencyContacts (Tepat 2 kontak)
        await tx.emergencyContact.createMany({
          data: validatedInput.emergencyContacts.map((contact) => ({
            bookingId: booking.id,
            name: contact.name,
            phone: normalizePhoneNumber(contact.phone),
            relationship: contact.relationship,
            order: contact.order,
          })),
        });

        // 4. Buat VehicleAvailabilityBlock (Mengunci tanggal segera)
        await tx.vehicleAvailabilityBlock.create({
          data: {
            vehicleId: validatedInput.vehicleId,
            startDate,
            endDate,
            reason: "BOOKED",
            bookingId: booking.id,
          },
        });

        // 5. Buat Deposit record (held status)
        await tx.deposit.create({
          data: {
            bookingId: booking.id,
            amount: priceBreakdown.depositAmount,
            status: "HELD",
          },
        });

        // 6. Buat RentalAgreement (Draft signed by renter)
        const agreementContent = generateAgreementContent({
          bookingCode,
          startDate,
          endDate,
          totalDays: priceBreakdown.totalDays,
          baseAmount: priceBreakdown.baseAmount,
          addonAmount: priceBreakdown.addonCost,
          deliveryCost: priceBreakdown.deliveryCost,
          discountAmount: priceBreakdown.totalDiscount,
          platformFee: priceBreakdown.platformFee,
          depositAmount: priceBreakdown.depositAmount,
          totalAmount: priceBreakdown.totalPayment,
          grandTotal: priceBreakdown.grandTotal,
          vehicle: lockedVehicle,
          renterName: sessionUserFullName,
          renterEmail: sessionUserEmail,
        });

        await tx.rentalAgreement.create({
          data: {
            bookingId: booking.id,
            status: "SIGNED_RENTER",
            renterSignature: validatedInput.renterSignature,
            renterSignedAt: new Date(),
            agreementContent,
          },
        });

        // 7. Increment Total Trips Vehicle (Atomic)
        await tx.vehicle.update({
          where: { id: validatedInput.vehicleId },
          data: {
            totalTrips: { increment: 1 },
          },
        });

        // 8. Buat AdminLog Audit Trail
        await tx.adminLog.create({
          data: {
            adminId: sessionUserId, // Renter diizinkan mendaftar aksi
            action: "BOOKING_CREATED",
            targetType: "BOOKING",
            targetId: booking.id,
            description: `Pemesanan ${bookingCode} berhasil dibuat oleh ${sessionUserFullName} untuk unit kendaraan ${lockedVehicle.brand} ${lockedVehicle.model}.`,
            metadata: {
              totalPayment: priceBreakdown.totalPayment,
              depositAmount: priceBreakdown.depositAmount,
              totalDays: priceBreakdown.totalDays,
            },
          },
        });

        return {
          booking,
          priceBreakdown,
          lockedVehicle,
          renter: {
            fullName: sessionUserFullName,
            email: sessionUserEmail,
          }
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 10000,
        maxWait: 5000,
      }
    );

    // ═══════════════════════════════════════
    // STEP 6: INISIASI PEMBAYARAN MIDTRANS (Di luar transaction agar DB connection cepat diputus)
    // ═══════════════════════════════════════
    let midtransResponse: { token: string; redirect_url: string; expiry: Date } | null = null;
    let paymentExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // Batas waktu bayar default 2 jam

    const totalBillWithDeposit = txResult.priceBreakdown.grandTotal;

    try {
      const renterNames = txResult.renter.fullName.split(" ");
      const firstName = renterNames[0] || "Penyewa";
      const lastName = renterNames.slice(1).join(" ") || "RentRide";

      // Item details di Midtrans Snap
      const itemDetails = [
        {
          id: `rental-${txResult.lockedVehicle.id}`,
          price: Number(txResult.priceBreakdown.subtotal),
          quantity: 1,
          name: `Sewa ${txResult.lockedVehicle.brand} ${txResult.lockedVehicle.model} (${txResult.priceBreakdown.totalDays} hari)`,
        },
        {
          id: "platform-fee",
          price: Number(txResult.priceBreakdown.platformFee),
          quantity: 1,
          name: "Biaya Layanan Platform",
        },
        {
          id: "security-deposit",
          price: Number(txResult.priceBreakdown.depositAmount),
          quantity: 1,
          name: "Jaminan Deposit (Refundable)",
        }
      ];

      midtransResponse = await createSnapToken({
        orderId: txResult.booking.bookingCode,
        grossAmount: totalBillWithDeposit,
        customerDetails: {
          firstName,
          lastName,
          email: txResult.renter.email,
          phone: "081234567890", // default mock jika tidak ada di session
        },
        itemDetails,
        expiryDuration: 120, // 2 jam
      });

      paymentExpiry = midtransResponse.expiry;
    } catch (midtransError) {
      console.error("[Midtrans Error] Gagal melakukan inisiasi pembayaran:", midtransError);
      
      // ROLLBACK SECARA MANUAL REKOR KARENA MIDTRANS GAGAL (Keluarkan jadwal kembali)
      await prisma.$transaction(async (tx) => {
        // Update booking status ke PAYMENT_FAILED
        await tx.booking.update({
          where: { id: txResult.booking.id },
          data: { status: "PAYMENT_FAILED" },
        });

        // Hapus ketersediaan blokir agar bisa dipesan kembali
        await tx.vehicleAvailabilityBlock.delete({
          where: { bookingId: txResult.booking.id },
        });
      });

      throw new BookingError("PAYMENT_INIT_FAILED", "Gagal memproses inisiasi modul gerbang pembayaran Midtrans Snap. Silakan ulangi pemesanan beberapa saat lagi.", true);
    }

    // ═══════════════════════════════════════
    // STEP 7: CREATE PAYMENT RECORD
    // ═══════════════════════════════════════
    await prisma.payment.create({
      data: {
        bookingId: txResult.booking.id,
        midtransOrderId: txResult.booking.bookingCode,
        amount: totalBillWithDeposit,
        status: "PENDING",
        snapToken: midtransResponse.token,
        paymentUrl: midtransResponse.redirect_url,
        expiredAt: paymentExpiry,
      }
    });

    // ═══════════════════════════════════════
    // STEP 8: KIRIM NOTIFIKASI SECARA ASINKRON (Fire-and-forget)
    // ═══════════════════════════════════════
    const owner = await prisma.user.findUnique({
      where: { id: txResult.lockedVehicle.owner_id },
      select: { phone: true, email: true },
    });

    Promise.allSettled([
      // WhatsApp ke Renter
      sendWhatsApp(
        "08123456789", // renter phone mock
        "BOOKING_PENDING_PAYMENT",
        {
          bookingCode: txResult.booking.bookingCode,
          vehicleName: `${txResult.lockedVehicle.brand} ${txResult.lockedVehicle.model}`,
          totalPayment: txResult.priceBreakdown.grandTotal,
          paymentUrl: midtransResponse.redirect_url,
          expiry: paymentExpiry.toLocaleTimeString("id-ID"),
        }
      ),
      // Email ke Renter
      sendEmail(
        txResult.renter.email,
        "booking-confirmation",
        {
          bookingCode: txResult.booking.bookingCode,
          vehicleName: `${txResult.lockedVehicle.brand} ${txResult.lockedVehicle.model}`,
          pickupDate: startDate.toLocaleDateString("id-ID"),
          returnDate: endDate.toLocaleDateString("id-ID"),
          paymentUrl: midtransResponse.redirect_url,
        }
      ),
      // WhatsApp ke Owner
      sendWhatsApp(
        owner?.phone || "08123456789",
        "NEW_BOOKING_REQUEST",
        {
          bookingCode: txResult.booking.bookingCode,
          vehicleName: `${txResult.lockedVehicle.brand} ${txResult.lockedVehicle.model}`,
          renterName: txResult.renter.fullName,
          period: `${startDate.toLocaleDateString("id-ID")} - ${endDate.toLocaleDateString("id-ID")}`,
        }
      ),
      // In-App Notification untuk renter
      prisma.notification.create({
        data: {
          userId: sessionUserId,
          bookingId: txResult.booking.id,
          channel: "IN_APP",
          title: "Tagihan Pembayaran Baru",
          message: `Booking sewa ${txResult.lockedVehicle.brand} Anda berhasil dibuat. Selesaikan pelunasan sebesar Rp ${txResult.priceBreakdown.grandTotal.toLocaleString("id-ID")} sebelum kedaluwarsa.`,
          status: "PENDING",
        }
      })
    ]).catch((err) => {
      console.error("[Notifikasi/Asinkron] Gagal mengirimkan notifikasi tetapi sewa aman tetap terdaftar:", err);
    });

    // ═══════════════════════════════════════
    // STEP 9: LOG PERFORMA & RETURN
    // ═══════════════════════════════════════
    const duration = performance.now() - startTime;
    console.log(
      `[CreateBooking] Berhasil diproses dalam ${duration.toFixed(0)}ms | ` +
      `BookingCode: ${txResult.booking.bookingCode} | ` +
      `GrandTotal: Rp ${txResult.priceBreakdown.grandTotal.toLocaleString("id-ID")}`
    );

    return {
      success: true,
      data: {
        bookingId: txResult.booking.id,
        bookingCode: txResult.booking.bookingCode,
        snapToken: midtransResponse.token,
        paymentUrl: midtransResponse.redirect_url,
        expiresAt: paymentExpiry.toISOString(),
        priceBreakdown: txResult.priceBreakdown,
        vehicleName: `${txResult.lockedVehicle.brand} ${txResult.lockedVehicle.model}`,
        pickupDateTime: startDate.toISOString(),
        returnDateTime: endDate.toISOString(),
      },
    };
  } catch (error) {
    return handleBookingError(error);
  }
}
