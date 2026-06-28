import { Prisma } from "@prisma/client";
import { CreateBookingError } from "../../types/booking";

export class BookingError extends Error {
  constructor(
    public code: CreateBookingError["errorCode"],
    public userMessage: string,    // pesan dalam Bahasa Indonesia yang ramah pengguna
    public retryable: boolean = false,
    public details?: Record<string, string[]>
  ) {
    super(userMessage);
    this.name = "BookingError";
    Object.setPrototypeOf(this, BookingError.prototype);
  }
}

/**
 * Error handler terpusat untuk proses pembayaran dan pemesanan kendaraan.
 * Mengonversi berbagai macam exception menjadi payload standard untuk disajikan ke user.
 */
export function handleBookingError(error: unknown): CreateBookingError {
  if (error instanceof BookingError) {
    return {
      success: false,
      errorCode: error.code,
      errorMessage: error.userMessage,
      details: error.details,
      retryable: error.retryable,
    };
  }
  
  // Prisma transaction conflict (deadlock/serialization)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2034") {
      // P2034 = Transaction conflict, bisa retry
      return {
        success: false,
        errorCode: "SCHEDULE_CONFLICT",
        errorMessage: "Terjadi konflik pemesanan. Sistem sedang memproses pesanan lain untuk kendaraan ini. Silakan coba lagi dalam beberapa detik.",
        retryable: true,
      };
    }
    
    if (error.code === "P2028") {
      // P2028 = Transaction timeout
      return {
        success: false,
        errorCode: "TRANSACTION_FAILED",
        errorMessage: "Pembuatan pesanan membutuhkan waktu terlalu lama karena antrean padat. Silakan coba lagi.",
        retryable: true,
      };
    }
  }
  
  // Unknown error
  console.error("[CreateBooking] Unexpected error:", error);
  return {
    success: false,
    errorCode: "TRANSACTION_FAILED",
    errorMessage: "Terjadi kesalahan sistem internal. Tim teknis RentRide telah diberitahu. Silakan coba lagi.",
    retryable: true,
  };
}
