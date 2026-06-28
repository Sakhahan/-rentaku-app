import { prisma } from "../prisma";

interface CleanupResult {
  processed: number;
  failed: number;
  errors: string[];
}

/**
 * Jalankan secara periodik (cron job) untuk membatalkan pesanan yang melampaui batas waktu pelunasan (expired).
 * Menghapus pemblokiran jadwal kendaraan agar bisa dipesan orang lain secara tepat waktu.
 */
export async function cleanupExpiredBookings(): Promise<CleanupResult> {
  const result: CleanupResult = {
    processed: 0,
    failed: 0,
    errors: [],
  };

  const now = new Date();

  try {
    // 1. Cari booking dengan status PENDING_PAYMENT yang telah kedaluwarsa berdasarkan Payment.expiredAt < now
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: "PENDING_PAYMENT",
        payment: {
          status: "PENDING",
          expiredAt: {
            lt: now,
          },
        },
      },
      include: {
        payment: true,
        renter: {
          select: {
            fullName: true,
            phone: true,
            email: true,
          }
        },
        vehicle: {
          select: {
            brand: true,
            model: true,
          }
        }
      },
    });

    console.log(`[Job: Cleanup] Menemukan ${expiredBookings.length} booking kedaluwarsa yang perlu diproses.`);

    for (const booking of expiredBookings) {
      try {
        // Melakukan update status booking + hapus block availability secara atomik per transaksi
        await prisma.$transaction(async (tx) => {
          // 2. Update status booking -> PAYMENT_FAILED
          await tx.booking.update({
            where: { id: booking.id },
            data: { status: "PAYMENT_FAILED" },
          });

          // Update status payment -> EXPIRED
          await tx.payment.update({
            where: { bookingId: booking.id },
            data: { status: "EXPIRED" },
          });

          // 3. Hapus VehicleAvailabilityBlock terkait (buka kembali jadwal)
          await tx.vehicleAvailabilityBlock.deleteMany({
            where: { bookingId: booking.id },
          });

          // Buat log sistem audit
          await tx.adminLog.create({
            data: {
              adminId: booking.renterId, // Log atas nama sistem/renter pembatalan
              action: "BOOKING_AUTO_EXPIRED",
              targetType: "BOOKING",
              targetId: booking.id,
              description: `Pemesanan ${booking.bookingCode} otomatis dibatalkan oleh sistem karena melampaui batas waktu toleransi pembayaran.`,
              metadata: {
                expiredAt: booking.payment?.expiredAt,
              },
            },
          });
        });

        // 4. Kirim notifikasi ke penyewa (di luar transaksi DB)
        console.log(`[Job: Cleanup] Booking ${booking.bookingCode} berhasil dibatalkan.`);
        
        // WhatsApp Simulasi
        console.log(`[WhatsApp HUD] Mengirim WA pembatalan ke ${booking.renter.phone}: "Waktu pembayaran untuk pemesanan sewa kendaraan ${booking.vehicle.brand} ${booking.vehicle.model} dengan kode ${booking.bookingCode} telah habis. Pesanan Anda otomatis dibatalkan."`);
        
        // In-App Notification
        await prisma.notification.create({
          data: {
            userId: booking.renterId,
            bookingId: booking.id,
            channel: "IN_APP",
            title: "Pemesanan Kedaluwarsa",
            message: `Pemesanan sewa kendaraan ${booking.vehicle.brand} (${booking.bookingCode}) otomatis dibatalkan sistem karena batas waktu pembayaran telah habis.`,
            status: "PENDING",
          }
        });

        result.processed += 1;
      } catch (bookingError: any) {
        result.failed += 1;
        const msg = `Booking ID ${booking.id} (${booking.bookingCode}) gagal dicancel: ${bookingError.message || bookingError}`;
        console.error(`[Job: Cleanup] ${msg}`);
        result.errors.push(msg);
      }
    }
  } catch (globalError: any) {
    const errorMsg = `Kesalahan menghentikan operasi berkala cleanup: ${globalError.message || globalError}`;
    console.error(`[Job: Cleanup Global Error] ${errorMsg}`);
    result.errors.push(errorMsg);
  }

  console.log(`[Job: Cleanup Selesai] Berhasil dibatalkan: ${result.processed}, Gagal: ${result.failed}, Error: ${result.errors.length}`);
  return result;
}
