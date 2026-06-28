import { PrismaClient } from "@prisma/client";

/**
 * Generate sebuah string kode random 5 karakter Alphanumeric Uppercase.
 * Menghilangkan huruf O, I, dan L untuk menghindari kerancuan dengan angka 0 dan 1.
 */
function randomAlphanumeric5(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // Tanpa I, L, O, 0, 1
  let result = "";
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars.charAt(randomIndex);
  }
  return result;
}

/**
 * Generate kode booking unik yang mudah dibaca manusia.
 * Format: RR-YYYYMMDD-XXXXX
 * Contoh: RR-20260620-A3K9M
 */
export function generateBookingCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  
  const randomPart = randomAlphanumeric5();
  return `RR-${year}${month}${date}-${randomPart}`;
}

/**
 * Memeriksa apakah kode booking sudah terdaftar di database.
 */
export async function isBookingCodeUnique(code: string, tx: any): Promise<boolean> {
  const booking = await tx.booking.findUnique({
    where: { bookingCode: code },
    select: { id: true }
  });
  return !booking;
}

/**
 * Memperoleh kode booking yang dijamin unik di database dengan percobaan ulang (retry).
 */
export async function generateUniqueBookingCode(tx: any): Promise<string> {
  const maxRetries = 5;
  for (let i = 0; i < maxRetries; i++) {
    const code = generateBookingCode();
    const isUnique = await isBookingCodeUnique(code, tx);
    if (isUnique) {
      return code;
    }
  }
  
  throw new Error("Gagal menggenerate kode booking unik setelah 5 kali percobaan.");
}
