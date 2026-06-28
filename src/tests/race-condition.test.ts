import { createBookingAction } from "../app/actions/create-booking";
import { prisma } from "../lib/prisma";

// Mock global test elements jika dijalankan di framework Jest/Vitest
declare let describe: any;
declare let it: any;
declare let expect: any;

const isTestingFramework = typeof describe !== "undefined";

/**
 * Menyiapkan basis data pengujian (seeding data pengetesan) secara asinkron.
 */
async function setupTestData() {
  console.log("[Test Setup] Menyiapkan data sewa tiruan untuk simulasi...");
  
  // Ambil atau buat User Renter 1 (Customer)
  let renter1 = await prisma.user.findFirst({ where: { email: "renter1@rentride.com" } });
  if (!renter1) {
    renter1 = await prisma.user.create({
      data: {
        email: "renter1@rentride.com",
        phone: "081111111111",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz",
        fullName: "Rendi Renter 1",
        referralCode: "RENTER1",
        role: "CUSTOMER",
        status: "ACTIVE",
      }
    });
  }

  // Ambil atau buat User Renter 2 (Customer)
  let renter2 = await prisma.user.findFirst({ where: { email: "renter2@rentride.com" } });
  if (!renter2) {
    renter2 = await prisma.user.create({
      data: {
        email: "renter2@rentride.com",
        phone: "082222222222",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz",
        fullName: "Rian Renter 2",
        referralCode: "RENTER2",
        role: "CUSTOMER",
        status: "ACTIVE",
      }
    });
  }

  // Buat KYC Dokumen terverifikasi untuk kedua customer
  await prisma.kycDocument.upsert({
    where: { userId: renter1.id },
    update: { status: "VERIFIED" },
    create: {
      userId: renter1.id,
      ktpNumber: "3270000000000001",
      ktpFrontUrl: "https://url.com/ktp1.jpg",
      ktpBackUrl: "https://url.com/ktp1b.jpg",
      selfieWithKtpUrl: "https://url.com/selfie1.jpg",
      simType: "SIM_A",
      simNumber: "1234-5678-9001",
      simUrl: "https://url.com/sim1.jpg",
      simExpiryDate: new Date("2030-12-31"),
      status: "VERIFIED",
    }
  });

  await prisma.kycDocument.upsert({
    where: { userId: renter2.id },
    update: { status: "VERIFIED" },
    create: {
      userId: renter2.id,
      ktpNumber: "3270000000000002",
      ktpFrontUrl: "https://url.com/ktp2.jpg",
      ktpBackUrl: "https://url.com/ktp2b.jpg",
      selfieWithKtpUrl: "https://url.com/selfie2.jpg",
      simType: "SIM_A",
      simNumber: "1234-5678-9002",
      simUrl: "https://url.com/sim2.jpg",
      simExpiryDate: new Date("2030-12-31"),
      status: "VERIFIED",
    }
  });

  // Ambil atau buat Owner User
  let owner = await prisma.user.findFirst({ where: { email: "owner@rentride.com" } });
  if (!owner) {
    owner = await prisma.user.create({
      data: {
        email: "owner@rentride.com",
        phone: "089999999999",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz",
        fullName: "Oki Owner",
        referralCode: "OKIOWNER",
        role: "CUSTOMER", // Owner are Customers who upload vehicles
        status: "ACTIVE",
      }
    });
  }

  // Ambil atau buat Platform Setting platform_fee_percentage
  const existingSetting = await prisma.platformSetting.findFirst({
    where: { key: "platform_fee_percentage" }
  });
  if (!existingSetting) {
    await prisma.platformSetting.create({
      data: {
        key: "platform_fee_percentage",
        value: "10",
        description: "Biaya Layanan Platform RentRide",
        updatedBy: owner.id,
      }
    });
  }

  const existingDepositSetting = await prisma.platformSetting.findFirst({
    where: { key: "deposit_percentage" }
  });
  if (!existingDepositSetting) {
    await prisma.platformSetting.create({
      data: {
        key: "deposit_percentage",
        value: "30",
        description: "Biaya Jaminan Keamanan Deposit",
        updatedBy: owner.id,
      }
    });
  }

  // Buat Vehicle aktif untuk disewa
  let testVehicle = await prisma.vehicle.findFirst({ where: { licensePlate: "B 1234 RENT" } });
  if (!testVehicle) {
    testVehicle = await prisma.vehicle.create({
      data: {
        ownerId: owner.id,
        type: "CAR",
        brand: "Toyota",
        model: "Avanza",
        year: 2023,
        color: "Hitam",
        licensePlate: "B 1234 RENT",
        transmission: "AUTOMATIC",
        fuelType: "GASOLINE",
        seatCapacity: 7,
        engineCC: 1500,
        description: "Mobil Avanza bersih terawat siap kendarai.",
        dailyRate: 350000,
        weekendRate: 400000,
        weeklyDiscount: 10,
        monthlyDiscount: 20,
        includesDriver: false,
        driverDailyRate: 150000,
        pickupAddress: "Jl. Margonda Raya No. 45, Depok",
        pickupLatitude: -6.3732,
        pickupLongitude: 106.8340,
        deliveryAvailable: true,
        deliveryRadiusKm: 25,
        deliveryCostPerKm: 10000,
        status: "ACTIVE",
      }
    });
  }

  return { renter1, renter2, testVehicle };
}

/**
 * Simulasi Pengujian Mandiri (Bisa dijalankan tanpa Jest via command line)
 */
async function runStandaloneSimulation() {
  console.log("\n=======================================================");
  console.log("SIMULASI MULTI-CONCURRENT USER - RENTRIDE RACE CONDITION");
  console.log("=======================================================\n");

  const { renter1, renter2, testVehicle } = await setupTestData();

  // Reset any existing blocks to clear states
  await prisma.vehicleAvailabilityBlock.deleteMany({
    where: { vehicleId: testVehicle.id }
  });

  console.log(`[Sim] Memulai 2 Pemesanan Paralel pada kendaraan yang sama (${testVehicle.brand} ${testVehicle.model}) pada periode tanggal yang tumpang tindih.`);

  const commonInput = {
    vehicleId: testVehicle.id,
    startDate: "2026-07-01T08:00:00.000Z",
    endDate: "2026-07-04T08:00:00.000Z",
    pickupMethod: "SELF_PICKUP" as const,
    addons: [],
    emergencyContacts: [
      { name: "Andi Darurat 1", phone: "081234567890", relationship: "FAMILY" as const, order: 1 as const },
      { name: "Budi Darurat 2", phone: "081234567891", relationship: "FRIEND" as const, order: 2 as const }
    ],
    renterSignature: "data:image/png;base64,abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789",
    agreeToTerms: true,
    agreeToDepositPolicy: true,
  };

  // Set env token agar memicu renter1 dan renter2 secara simulasi
  process.env.DEV_USER_ID = renter1.id;
  const req1 = createBookingAction(commonInput);

  // Buat request kedua
  process.env.DEV_USER_ID = renter2.id;
  const req2 = createBookingAction(commonInput);

  console.log("[Sim] Mengeksekusi database transaction concurrently (Promise.all)...");
  const [result1, result2] = await Promise.all([req1, req2]);

  const successes = [result1, result2].filter(r => r.success === true);
  const failures = [result1, result2].filter(r => r.success === false);

  console.log(`\n=== HASIL SIMULASI PARALEL ===`);
  console.log(`Berhasil: ${successes.length} Transaksi`);
  console.log(`Gagal: ${failures.length} Transaksi`);

  if (successes.length === 1 && failures.length === 1) {
    console.log("✅ SUKSES: Proteksi Race Condition berfungsi sempurna! Hanya ada satu pesanan yang disetujui, dan pesanan lainnya ditolak.");
    // @ts-ignore
    console.log(`- Pesanan Sukses: ${successes[0].data.bookingCode}`);
    // @ts-ignore
    console.log(`- Pesanan Gagal: ${failures[0].errorCode} - ${failures[0].errorMessage}`);
  } else {
    console.error("❌ GAGAL: Terjadi pelanggaran data! Kemungkinan double booking terjadi.");
  }

  // Clean kembali
  await prisma.vehicleAvailabilityBlock.deleteMany({
    where: { bookingId: { in: [
      // @ts-ignore
      successes[0]?.data?.bookingId || "",
      // @ts-ignore
      failures[0]?.data?.bookingId || ""
    ]}}
  });

  await prisma.booking.deleteMany({
    where: { vehicleId: testVehicle.id }
  });

  console.log("\nSimulasi Selesai.");
  process.exit(0);
}

// Eksekusi jika file diimport langsung atau dipanggil langsung
if (!isTestingFramework) {
  runStandaloneSimulation().catch(err => {
    console.error("Kesalahan simulasi:", err);
    process.exit(1);
  });
}

// ═══════════════════════════════════════
// STANDARD TEST SUITE (Untuk integrasi unit test)
// ═══════════════════════════════════════
if (isTestingFramework) {
  describe("RentRide Race Condition & double-booking protection Tests", () => {
    it("harus menyetujui salah satu dan menolak pesanan kedua pada pemesanan yang bersamaan", async () => {
      const { renter1, renter2, testVehicle } = await setupTestData();
      
      await prisma.vehicleAvailabilityBlock.deleteMany({
        where: { vehicleId: testVehicle.id }
      });

      const commonInput = {
        vehicleId: testVehicle.id,
        startDate: "2025-07-01T08:00:00.000Z",
        endDate: "2025-07-04T08:00:00.000Z",
        pickupMethod: "SELF_PICKUP" as const,
        addons: [],
        emergencyContacts: [
          { name: "Andi Darurat 1", phone: "081234567890", relationship: "FAMILY" as const, order: 1 as const },
          { name: "Budi Darurat 2", phone: "081234567891", relationship: "FRIEND" as const, order: 2 as const }
        ],
        renterSignature: "data:image/png;base64,abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789",
        agreeToTerms: true,
        agreeToDepositPolicy: true,
      };

      process.env.DEV_USER_ID = renter1.id;
      const t1 = createBookingAction(commonInput);

      process.env.DEV_USER_ID = renter2.id;
      const t2 = createBookingAction(commonInput);

      const [r1, r2] = await Promise.all([t1, t2]);

      const wins = [r1, r2].filter(r => r.success);
      const losses = [r1, r2].filter(r => !r.success);

      expect(wins).toHaveLength(1);
      expect(losses).toHaveLength(1);
      // @ts-ignore
      expect(losses[0].errorCode).toBe("SCHEDULE_CONFLICT");
    });

    it("harus menolak booking yang overlap sebagian jadwal", async () => {
      const { renter1, renter2, testVehicle } = await setupTestData();

      const baseInput = {
        vehicleId: testVehicle.id,
        startDate: "2025-07-10T08:00:00.000Z",
        endDate: "2025-07-15T08:00:00.000Z",
        pickupMethod: "SELF_PICKUP" as const,
        addons: [],
        emergencyContacts: [
          { name: "Andi Darurat 1", phone: "081234567890", relationship: "FAMILY" as const, order: 1 as const },
          { name: "Budi Darurat 2", phone: "081234567891", relationship: "FRIEND" as const, order: 2 as const }
        ],
        renterSignature: "data:image/png;base64,abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789",
        agreeToTerms: true,
        agreeToDepositPolicy: true,
      };

      process.env.DEV_USER_ID = renter1.id;
      const baseResult = await createBookingAction(baseInput);
      expect(baseResult.success).toBe(true);

      // Tanggal overlap 12 Juli - 17 Juli
      const overlapInput = {
        ...baseInput,
        startDate: "2025-07-12T08:00:00.000Z",
        endDate: "2025-07-17T08:00:00.000Z",
      };

      process.env.DEV_USER_ID = renter2.id;
      const overlapResult = await createBookingAction(overlapInput);
      expect(overlapResult.success).toBe(false);
      // @ts-ignore
      expect(overlapResult.errorCode).toBe("SCHEDULE_CONFLICT");
    });

    it("harus mengizinkan booking yang tidak overlap (estafet sewa langsung)", async () => {
      const { renter2, testVehicle } = await setupTestData();

      const consecutiveInput = {
        vehicleId: testVehicle.id,
        startDate: "2025-07-15T08:00:00.000Z", // mulai tepat saat booking pertama selesai
        endDate: "2025-07-18T08:00:00.000Z",
        pickupMethod: "SELF_PICKUP" as const,
        addons: [],
        emergencyContacts: [
          { name: "Andi Darurat 1", phone: "081234567890", relationship: "FAMILY" as const, order: 1 as const },
          { name: "Budi Darurat 2", phone: "081234567891", relationship: "FRIEND" as const, order: 2 as const }
        ],
        renterSignature: "data:image/png;base64,abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789",
        agreeToTerms: true,
        agreeToDepositPolicy: true,
      };

      process.env.DEV_USER_ID = renter2.id;
      const result = await createBookingAction(consecutiveInput);
      expect(result.success).toBe(true);
    });
  });
}
