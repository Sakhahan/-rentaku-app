import { z } from "zod";

const indonesianPhoneRegex = /^(08|628)\d{8,11}$/;

export const createBookingSchema = z.object({
  // Step 1: Kendaraan & Tanggal
  vehicleId: z.string().cuid("ID Kendaraan tidak valid"),
  
  startDate: z.string().min(1, "Tanggal mulai wajib diisi").refine((val) => {
    try {
      const date = new Date(val);
      return !isNaN(date.getTime());
    } catch {
      return false;
    }
  }, { message: "Format tanggal mulai tidak valid" }),
  
  endDate: z.string().min(1, "Tanggal selesai wajib diisi").refine((val) => {
    try {
      const date = new Date(val);
      return !isNaN(date.getTime());
    } catch {
      return false;
    }
  }, { message: "Format tanggal selesai tidak valid" }),

  // Step 2: Metode Pengambilan
  pickupMethod: z.enum(["SELF_PICKUP", "DELIVERY"]),
  deliveryAddress: z.string().optional(),
  deliveryLatitude: z.number().optional(),
  deliveryLongitude: z.number().optional(),

  // Step 3: Layanan Tambahan
  addons: z.array(
    z.object({
      type: z.enum(["DRIVER", "CHILD_SEAT", "EXTRA_INSURANCE", "GPS_DEVICE", "FULL_TANK"]),
      quantity: z.number().int().min(1, "Jumlah minimal 1").max(1, "Jumlah maksimal adalah 1"),
    })
  ).default([]).refine((addons) => {
    const types = addons.map((a) => a.type);
    return types.length === new Set(types).size;
  }, { message: "Layanan tambahan tidak boleh duplikat" }),

  // Step 4: Kontak Darurat
  emergencyContacts: z.array(
    z.object({
      name: z.string().min(3, "Nama kontak darurat minimal harus 3 karakter"),
      phone: z.string().refine((phone) => indonesianPhoneRegex.test(phone), {
        message: "Format nomor telepon tidak valid. Gunakan format Indonesia (contoh: 0812xxxxx atau 62812xxxxx)",
      }),
      relationship: z.enum(["FAMILY", "SPOUSE", "FRIEND", "COLLEAGUE"]),
      order: z.union([z.literal(1), z.literal(2)]),
    })
  ).refine((contacts) => contacts.length === 2, {
    message: "Wajib menyertakan tepat 2 kontak darurat",
  }).refine((contacts) => {
    if (contacts.length !== 2) return false;
    return contacts[0].order !== contacts[1].order;
  }, { message: "Urutan kontak darurat (order) tidak boleh sama" }),

  // Step 5: Voucher (opsional)
  voucherCode: z.string()
    .max(20, "Kode voucher maksimal 20 karakter")
    .regex(/^[a-zA-Z0-9-]+$/, { message: "Kode voucher hanya boleh berisi karakter alfanumerik dan tanda hubung" })
    .transform((val) => val?.toUpperCase())
    .optional(),

  // Step 6: Tanda Tangan Digital (Base64)
  renterSignature: z.string().min(100, "Silakan bubuhkan tanda tangan digital Anda dengan benar"),

  // Step 7: Persetujuan
  agreeToTerms: z.boolean().refine((val) => val === true, "Anda wajib menyetujui Syarat dan Ketentuan"),

  agreeToDepositPolicy: z.boolean().refine((val) => val === true, "Anda wajib menyetujui Kebijakan Jaminan Deposit"),
})
// Refinement gabungan untuk validasi conditional alamat delivery & tanggal sewa
.superRefine((data, ctx) => {
  // Validasi Delivery
  if (data.pickupMethod === "DELIVERY") {
    if (!data.deliveryAddress || data.deliveryAddress.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryAddress"],
        message: "Alamat pengiriman wajib diisi jika Anda memilih metode pengiriman (DELIVERY)",
      });
    }
    if (data.deliveryLatitude === undefined || data.deliveryLongitude === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryAddress"],
        message: "Koordinat peta pengiriman wajib diset di peta",
      });
    }
  }

  // Validasi Tanggal
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
    const now = new Date();
    // buffer 1 jam (dikurangi sedikit toleransi jika ada beda detik server agar tidak rigid)
    const minStart = new Date(now.getTime() + 60 * 60 * 1000 - 10000); 

    if (start < minStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "Waktu sewa dimulai minimal harus 1 jam dari waktu sekarang",
      });
    }

    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "Tanggal selesai sewa harus setelah tanggal mulai sewa",
      });
    }

    // Tidak boleh di hari yang sama (harus beda tanggal)
    if (start.toDateString() === end.toDateString()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "Periode sewa tidak bisa dimulai dan diselesaikan pada hari kalender yang sama",
      });
    }

    const durationDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (durationDays < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "Durasi sewa minimal adalah 1 hari (24 jam)",
      });
    }

    if (durationDays > 90) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "Durasi sewa maksimal adalah 90 hari",
      });
    }
  }
});
