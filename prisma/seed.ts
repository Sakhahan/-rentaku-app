import { PrismaClient, UserRole, UserStatus, KycStatus, SimType, VehicleType, VehicleStatus, TransmissionType, FuelType, BookingStatus, PaymentStatus, DepositStatus, ReviewTarget } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting RentRide Database Seeding...");

  // We wrap all creations inside a single interactive transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    
    // ==========================================
    // 1. SEED USERS
    // ==========================================
    console.log("➡️ Seeding Users...");

    // Password hash for "Password123!"
    const passwordHash = "$2b$10$w8Dqf1N7rPjJ6uW60X1x/O/KRE9gG8Wfe4f83659yK0Z6u5T.2g4y";

    const usersData = [
      {
        id: "u-admin-01",
        email: "admin@rentride.id",
        phone: "081234567890",
        passwordHash,
        fullName: "Budi Santoso",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        isPhoneVerified: true,
        referralCode: "REF-ADMIN",
      },
      {
        id: "u-owner-01",
        email: "andi@owner.com",
        phone: "082111222333",
        passwordHash,
        fullName: "Andi Wijaya",
        avatarUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=120",
        role: UserRole.OWNER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        isPhoneVerified: true,
        referralCode: "REF-ANDIWIJAYA",
      },
      {
        id: "u-owner-02",
        email: "siti@owner.com",
        phone: "083333444555",
        passwordHash,
        fullName: "Siti Rahayu",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
        role: UserRole.OWNER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        isPhoneVerified: true,
        referralCode: "REF-SITIRAHAYU",
      },
      {
        id: "u-owner-03",
        email: "rudi@owner.com",
        phone: "084444555666",
        passwordHash,
        fullName: "Rudi Hermawan",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
        role: UserRole.OWNER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        isPhoneVerified: true,
        referralCode: "REF-RUDIHERMAWAN",
      },
      {
        id: "u-customer-01",
        email: "dika@gmail.com",
        phone: "085555666777",
        passwordHash,
        fullName: "Dika Pratama",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        isPhoneVerified: true,
        referralCode: "REF-DIKAPRATAMA",
      },
      {
        id: "u-customer-02",
        email: "maya@gmail.com",
        phone: "086666777888",
        passwordHash,
        fullName: "Maya Kusuma",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120",
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        isPhoneVerified: false,
        referralCode: "REF-MAYAKUSUMA",
      },
      {
        id: "u-customer-03",
        email: "fajar@gmail.com",
        phone: "087777888999",
        passwordHash,
        fullName: "Fajar Nugroho",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120",
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        isEmailVerified: false,
        isPhoneVerified: false,
        referralCode: "REF-FAJARNUGROHO",
      },
      {
        id: "u-customer-04",
        email: "rina@gmail.com",
        phone: "088888999000",
        passwordHash,
        fullName: "Rina Wulandari",
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        isPhoneVerified: true,
        referralCode: "REF-RINAWULANDARI",
      },
      {
        id: "u-customer-05",
        email: "hendra@gmail.com",
        phone: "089999000111",
        passwordHash,
        fullName: "Hendra Saputra",
        avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120",
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        isPhoneVerified: true,
        referralCode: "REF-HENDRASAPUTRA",
      }
    ];

    for (const u of usersData) {
      await tx.user.upsert({
        where: { id: u.id },
        update: {
          email: u.email,
          phone: u.phone,
          passwordHash: u.passwordHash,
          fullName: u.fullName,
          avatarUrl: u.avatarUrl,
          role: u.role,
          status: u.status,
          isEmailVerified: u.isEmailVerified,
          isPhoneVerified: u.isPhoneVerified,
          referralCode: u.referralCode,
        },
        create: u,
      });
    }

    // ==========================================
    // 2. SEED KYC DOCUMENTS
    // ==========================================
    console.log("➡️ Seeding KYC Documents...");

    const kycData = [
      {
        id: "kyc-owner-01",
        userId: "u-owner-01", // Andi Wijaya
        ktpNumber: "3171012345670001",
        ktpFrontUrl: "https://example.com/kyc/andi-ktp-front.jpg",
        ktpBackUrl: "https://example.com/kyc/andi-ktp-back.jpg",
        selfieWithKtpUrl: "https://example.com/kyc/andi-selfie.jpg",
        faceMatchScore: 98.5,
        simType: SimType.SIM_B1,
        simNumber: "900812345678",
        simUrl: "https://example.com/kyc/andi-sim.jpg",
        simExpiryDate: new Date("2030-12-31"),
        status: KycStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: "u-admin-01",
        expiresAt: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000), // 12 Months
      },
      {
        id: "kyc-owner-02",
        userId: "u-owner-02", // Siti Rahayu
        ktpNumber: "3171012345670002",
        ktpFrontUrl: "https://example.com/kyc/siti-ktp-front.jpg",
        ktpBackUrl: "https://example.com/kyc/siti-ktp-back.jpg",
        selfieWithKtpUrl: "https://example.com/kyc/siti-selfie.jpg",
        faceMatchScore: 95.0,
        simType: SimType.SIM_A,
        simNumber: "910812345678",
        simUrl: "https://example.com/kyc/siti-sim.jpg",
        simExpiryDate: new Date("2029-08-15"),
        status: KycStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: "u-admin-01",
        expiresAt: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: "kyc-owner-03",
        userId: "u-owner-03", // Rudi Hermawan
        ktpNumber: "3171012345670003",
        ktpFrontUrl: "https://example.com/kyc/rudi-ktp-front.jpg",
        ktpBackUrl: "https://example.com/kyc/rudi-ktp-back.jpg",
        selfieWithKtpUrl: "https://example.com/kyc/rudi-selfie.jpg",
        faceMatchScore: 92.4,
        simType: SimType.SIM_B2,
        simNumber: "920812345678",
        simUrl: "https://example.com/kyc/rudi-sim.jpg",
        simExpiryDate: new Date("2028-05-20"),
        status: KycStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: "u-admin-01",
        expiresAt: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: "kyc-customer-01",
        userId: "u-customer-01", // Dika Pratama
        ktpNumber: "3171012345670004",
        ktpFrontUrl: "https://example.com/kyc/dika-ktp-front.jpg",
        ktpBackUrl: "https://example.com/kyc/dika-ktp-back.jpg",
        selfieWithKtpUrl: "https://example.com/kyc/dika-selfie.jpg",
        faceMatchScore: 97.2,
        simType: SimType.SIM_A,
        simNumber: "930812345678",
        simUrl: "https://example.com/kyc/dika-sim.jpg",
        simExpiryDate: new Date("2031-01-10"),
        status: KycStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: "u-admin-01",
        expiresAt: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: "kyc-customer-02",
        userId: "u-customer-02", // Maya Kusuma
        ktpNumber: "3171012345670005",
        ktpFrontUrl: "https://example.com/kyc/maya-ktp-front.jpg",
        ktpBackUrl: "https://example.com/kyc/maya-ktp-back.jpg",
        selfieWithKtpUrl: "https://example.com/kyc/maya-selfie.jpg",
        faceMatchScore: 89.1,
        simType: SimType.SIM_A,
        simNumber: "940812345678",
        simUrl: "https://example.com/kyc/maya-sim.jpg",
        simExpiryDate: new Date("2027-11-25"),
        status: KycStatus.PENDING,
      },
      {
        id: "kyc-customer-04",
        userId: "u-customer-04", // Rina Wulandari
        ktpNumber: "3171012345670006",
        ktpFrontUrl: "https://example.com/kyc/rina-ktp-front.jpg",
        ktpBackUrl: "https://example.com/kyc/rina-ktp-back.jpg",
        selfieWithKtpUrl: "https://example.com/kyc/rina-selfie.jpg",
        faceMatchScore: 99.1,
        simType: SimType.SIM_C,
        simNumber: "95size12345678",
        simUrl: "https://example.com/kyc/rina-sim.jpg",
        simExpiryDate: new Date("2030-04-18"),
        status: KycStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: "u-admin-01",
        expiresAt: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: "kyc-customer-05",
        userId: "u-customer-05", // Hendra Saputra
        ktpNumber: "3171012345670007",
        ktpFrontUrl: "https://example.com/kyc/hendra-ktp-front.jpg",
        ktpBackUrl: "https://example.com/kyc/hendra-ktp-back.jpg",
        selfieWithKtpUrl: "https://example.com/kyc/hendra-selfie.jpg",
        faceMatchScore: 40.5,
        simType: SimType.SIM_A,
        simNumber: "960812345678",
        simUrl: "https://example.com/kyc/hendra-sim.jpg",
        simExpiryDate: new Date("2026-05-12"),
        status: KycStatus.REJECTED,
        rejectionReason: "Selfie and KTP Face Similarity Score is below 50%",
      }
    ];

    for (const k of kycData) {
      await tx.kycDocument.upsert({
        where: { id: k.id },
        update: k,
        create: k,
      });
    }

    // ==========================================
    // 3. SEED VEHICLES
    // ==========================================
    console.log("➡️ Seeding Vehicles...");

    const vehiclesData = [
      // CARS
      {
        id: "v-car-01",
        ownerId: "u-owner-01", // Andi
        type: VehicleType.CAR,
        brand: "Toyota",
        model: "Avanza",
        year: 2022,
        color: "Hitam",
        licensePlate: "B 1234 ABC",
        transmission: TransmissionType.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        seatCapacity: 7,
        engineCC: 1500,
        description: "Toyota Avanza nyaman untuk perjalanan keluarga. Kondisi prima dan bersih.",
        dailyRate: 350000,
        pickupAddress: "Sedayu City, Kelapa Gading, Jakarta Utara",
        pickupLatitude: -6.1620,
        pickupLongitude: 106.9082,
        status: VehicleStatus.ACTIVE,
        totalTrips: 15,
        averageRating: 4.8,
        totalReviews: 1,
      },
      {
        id: "v-car-02",
        ownerId: "u-owner-02", // Siti
        type: VehicleType.CAR,
        brand: "Honda",
        model: "CR-V",
        year: 2023,
        color: "Putih",
        licensePlate: "B 5678 DEF",
        transmission: TransmissionType.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        seatCapacity: 5,
        engineCC: 1500,
        description: "Premium SUV Honda CR-V dengan panoramic sunroof dan kabin yang sangat senyap.",
        dailyRate: 650000,
        pickupAddress: "Kebayoran Baru, Jakarta Selatan",
        pickupLatitude: -6.2442,
        pickupLongitude: 106.7973,
        status: VehicleStatus.ACTIVE,
        totalTrips: 8,
        averageRating: 5.0,
        totalReviews: 0,
      },
      {
        id: "v-car-03",
        ownerId: "u-owner-01", // Andi
        type: VehicleType.CAR,
        brand: "Daihatsu",
        model: "Xenia",
        year: 2021,
        color: "Silver",
        licensePlate: "D 9012 GHI",
        transmission: TransmissionType.MANUAL,
        fuelType: FuelType.GASOLINE,
        seatCapacity: 7,
        engineCC: 1300,
        description: "Daihatsu Xenia murah dan irit bahan bakar, cocok untuk keliling kota.",
        dailyRate: 300000,
        pickupAddress: "Dago, Bandung",
        pickupLatitude: -6.8833,
        pickupLongitude: 107.6167,
        status: VehicleStatus.ACTIVE,
        totalTrips: 34,
        averageRating: 4.5,
        totalReviews: 0,
      },
      {
        id: "v-car-04",
        ownerId: "u-owner-01", // Andi
        type: VehicleType.CAR,
        brand: "Mitsubishi",
        model: "Pajero Sport",
        year: 2022,
        color: "Hitam",
        licensePlate: "B 3456 JKL",
        transmission: TransmissionType.AUTOMATIC,
        fuelType: FuelType.DIESEL,
        seatCapacity: 7,
        engineCC: 2400,
        description: "Gagah dan tangguh, Mitsubishi Pajero Sport siap melibas segala medan.",
        dailyRate: 950000,
        pickupAddress: "Kelapa Gading, Jakarta Utara",
        pickupLatitude: -6.1581,
        pickupLongitude: 106.9032,
        status: VehicleStatus.ACTIVE,
        totalTrips: 5,
        averageRating: 4.9,
        totalReviews: 0,
      },
      {
        id: "v-car-05",
        ownerId: "u-owner-02", // Siti
        type: VehicleType.CAR,
        brand: "Toyota",
        model: "Innova Reborn",
        year: 2023,
        color: "Putih",
        licensePlate: "F 7890 MNO",
        transmission: TransmissionType.AUTOMATIC,
        fuelType: FuelType.DIESEL,
        seatCapacity: 8,
        engineCC: 2400,
        description: "Toyota Innova Reborn bertenaga diesel. Sangat luas, suspensi empuk, handal.",
        dailyRate: 500000,
        pickupAddress: "Semplak, Bogor",
        pickupLatitude: -6.5542,
        pickupLongitude: 106.7513,
        status: VehicleStatus.ACTIVE,
        totalTrips: 12,
        averageRating: 4.7,
        totalReviews: 0,
      },

      // MOTORCYCLES
      {
        id: "v-bike-01",
        ownerId: "u-owner-03", // Rudi
        type: VehicleType.MOTORCYCLE,
        brand: "Honda",
        model: "Beat",
        year: 2023,
        color: "Biru",
        licensePlate: "B 2345 PQR",
        transmission: TransmissionType.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        seatCapacity: 2,
        engineCC: 110,
        description: "Honda Beat lincah dan hemat bensin. Cocok untuk menembus kemacetan Jakarta.",
        dailyRate: 75000,
        pickupAddress: "Kuningan, Jakarta Selatan",
        pickupLatitude: -6.2239,
        pickupLongitude: 106.8290,
        status: VehicleStatus.ACTIVE,
        totalTrips: 45,
        averageRating: 4.6,
        totalReviews: 0,
      },
      {
        id: "v-bike-02",
        ownerId: "u-owner-02", // Siti
        type: VehicleType.MOTORCYCLE,
        brand: "Yamaha",
        model: "NMAX",
        year: 2022,
        color: "Hitam",
        licensePlate: "B 6789 STU",
        transmission: TransmissionType.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        seatCapacity: 2,
        engineCC: 155,
        description: "Yamaha NMAX nyaman disewa dengan bagasi ekstra luas untuk membawa barang bawaan.",
        dailyRate: 12000, // Wait, Rp 120.000, so 120000
        pickupAddress: "Tebet, Jakarta Selatan",
        pickupLatitude: -6.2285,
        pickupLongitude: 106.8572,
        status: VehicleStatus.ACTIVE,
        totalTrips: 3,
        averageRating: 5.0,
        totalReviews: 0,
      },
      {
        id: "v-bike-03",
        ownerId: "u-owner-03", // Rudi
        type: VehicleType.MOTORCYCLE,
        brand: "Honda",
        model: "PCX",
        year: 2023,
        color: "Putih",
        licensePlate: "B 0123 VWX",
        transmission: TransmissionType.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        seatCapacity: 2,
        engineCC: 160,
        description: "Honda PCX elegan, jok empuk luar biasa untuk perjalanan jarak jauh.",
        dailyRate: 130000,
        pickupAddress: "Palmerah, Jakarta Barat",
        pickupLatitude: -6.2078,
        pickupLongitude: 106.7902,
        status: VehicleStatus.ACTIVE,
        totalTrips: 20,
        averageRating: 4.8,
        totalReviews: 0,
      },
      {
        id: "v-bike-04",
        ownerId: "u-owner-03", // Rudi
        type: VehicleType.MOTORCYCLE,
        brand: "Yamaha",
        model: "Aerox",
        year: 2022,
        color: "Merah",
        licensePlate: "D 4567 YZA",
        transmission: TransmissionType.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        seatCapacity: 2,
        engineCC: 155,
        description: "Sporty scooter Yamaha Aerox, performa mantap dan akselerasi responsif.",
        dailyRate: 110000,
        pickupAddress: "Cibeunying, Bandung",
        pickupLatitude: -6.9007,
        pickupLongitude: 107.6339,
        status: VehicleStatus.ACTIVE,
        totalTrips: 18,
        averageRating: 4.4,
        totalReviews: 0,
      },
      {
        id: "v-bike-05",
        ownerId: "u-owner-02", // Siti
        type: VehicleType.MOTORCYCLE,
        brand: "Honda",
        model: "Scoopy",
        year: 2023,
        color: "Krem",
        licensePlate: "B 8901 BCD",
        transmission: TransmissionType.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        seatCapacity: 2,
        engineCC: 110,
        description: "Desain retro estetik, Honda Scoopy digemari untuk area perkotaan santai.",
        dailyRate: 80000,
        pickupAddress: "Kebayoran Baru, Jakarta Selatan",
        pickupLatitude: -6.2440,
        pickupLongitude: 106.7972,
        status: VehicleStatus.ACTIVE,
        totalTrips: 2,
        averageRating: 4.0,
        totalReviews: 0,
      }
    ];

    // Correct the NMAX rate to 120,000 as specified
    const indexNmax = vehiclesData.findIndex(v => v.id === "v-bike-02");
    if (indexNmax !== -1) {
      vehiclesData[indexNmax].dailyRate = 120000;
    }

    for (const v of vehiclesData) {
      await tx.vehicle.upsert({
        where: { id: v.id },
        update: {
          ownerId: v.ownerId,
          type: v.type,
          brand: v.brand,
          model: v.model,
          year: v.year,
          color: v.color,
          licensePlate: v.licensePlate,
          transmission: v.transmission,
          fuelType: v.fuelType,
          seatCapacity: v.seatCapacity,
          engineCC: v.engineCC,
          description: v.description,
          dailyRate: v.dailyRate,
          pickupAddress: v.pickupAddress,
          pickupLatitude: v.pickupLatitude,
          pickupLongitude: v.pickupLongitude,
          status: v.status,
          totalTrips: v.totalTrips,
          averageRating: v.averageRating,
          totalReviews: v.totalReviews,
        },
        create: v,
      });
    }

    // ==========================================
    // 4. SEED VEHICLE FEATURES
    // ==========================================
    console.log("➡️ Seeding Vehicle Features...");

    const featuresData = [
      // Avanza Features
      { id: "vf-01", vehicleId: "v-car-01", name: "AC", isAvailable: true },
      { id: "vf-02", vehicleId: "v-car-01", name: "MusicSystem", isAvailable: true },
      { id: "vf-03", vehicleId: "v-car-01", name: "BackCamera", isAvailable: true },

      // CR-V Features
      { id: "vf-04", vehicleId: "v-car-02", name: "AC", isAvailable: true },
      { id: "vf-05", vehicleId: "v-car-02", name: "GPS", isAvailable: true },
      { id: "vf-06", vehicleId: "v-car-02", name: "Sunroof", isAvailable: true },
      { id: "vf-07", vehicleId: "v-car-02", name: "BackCamera", isAvailable: true },
      { id: "vf-08", vehicleId: "v-car-02", name: "Bluetooth", isAvailable: true },

      // Xenia Features
      { id: "vf-09", vehicleId: "v-car-03", name: "AC", isAvailable: true },
      { id: "vf-10", vehicleId: "v-car-03", name: "MusicSystem", isAvailable: true },

      // Pajero Features
      { id: "vf-11", vehicleId: "v-car-04", name: "AC", isAvailable: true },
      { id: "vf-12", vehicleId: "v-car-04", name: "GPS", isAvailable: true },
      { id: "vf-13", vehicleId: "v-car-04", name: "Sunroof", isAvailable: true },
      { id: "vf-14", vehicleId: "v-car-04", name: "Dashcam", isAvailable: true },
      { id: "vf-15", vehicleId: "v-car-04", name: "Bluetooth", isAvailable: true },

      // Innova Features
      { id: "vf-16", vehicleId: "v-car-05", name: "AC", isAvailable: true },
      { id: "vf-17", vehicleId: "v-car-05", name: "MusicSystem", isAvailable: true },
      { id: "vf-18", vehicleId: "v-car-05", name: "Bluetooth", isAvailable: true },
      { id: "vf-19", vehicleId: "v-car-05", name: "BackCamera", isAvailable: true },
    ];

    for (const f of featuresData) {
      await tx.vehicleFeature.upsert({
        where: { id: f.id },
        update: f,
        create: f,
      });
    }

    // ==========================================
    // 5. SEED BOOKINGS
    // ==========================================
    console.log("➡️ Seeding Bookings...");

    const bookingsData = [
      {
        id: "b-booking-01",
        bookingCode: "RR-20260610-00001",
        renterId: "u-customer-01", // Dika Pratama
        vehicleId: "v-car-01", // Avanza (Andi Wijaya)
        startDate: new Date("2026-06-10T10:00:00Z"),
        endDate: new Date("2026-06-13T10:00:00Z"),
        totalDays: 3,
        pickupMethod: "SELF_PICKUP",
        dailyRate: 350000,
        baseAmount: 1050000, // 3 * 350,000
        platformFee: 105000, // 10%
        depositAmount: 315000, // 30%
        totalAmount: 1470000, // base + fee + deposit
        status: BookingStatus.COMPLETED,
        confirmedAt: new Date("2026-06-10T09:00:00Z"),
        startedAt: new Date("2026-06-10T10:05:00Z"),
        completedAt: new Date("2026-06-13T10:15:00Z"),
      },
      {
        id: "b-booking-02",
        bookingCode: "RR-20260619-00002",
        renterId: "u-customer-04", // Rina Wulandari
        vehicleId: "v-bike-02", // NMAX (Siti Rahayu)
        startDate: new Date("2026-06-19T08:00:00Z"),
        endDate: new Date("2026-06-21T08:00:00Z"),
        totalDays: 2,
        pickupMethod: "SELF_PICKUP",
        dailyRate: 120000,
        baseAmount: 240000, // 2 * 120,000
        platformFee: 24000, // 10%
        depositAmount: 72000, // 30%
        totalAmount: 3360000, // 240k + 24k + 72k = 336,000 (Wait, 3360000 is typo in my calculation, let's make it 336000)
        status: BookingStatus.ACTIVE,
        confirmedAt: new Date("2026-06-19T07:15:00Z"),
        startedAt: new Date("2026-06-19T08:10:00Z"),
      },
      {
        id: "b-booking-03",
        bookingCode: "RR-20260622-00003",
        renterId: "u-customer-01", // Dika Pratama
        vehicleId: "v-car-02", // CR-V (Siti Rahayu)
        startDate: new Date("2026-06-22T09:00:00Z"),
        endDate: new Date("2026-06-27T09:00:00Z"),
        totalDays: 5,
        pickupMethod: "SELF_PICKUP",
        dailyRate: 650000,
        baseAmount: 3250000, // 5 * 650,000
        platformFee: 325000, // 10%
        depositAmount: 975000, // 30%
        totalAmount: 4550000, // 3250k + 325k + 975k
        status: BookingStatus.CONFIRMED,
        confirmedAt: new Date("2026-06-20T10:00:00Z"),
      }
    ];

    // Correcting Rina's Booking totalAmount calculation
    bookingsData[1].totalAmount = 336000;

    for (const b of bookingsData) {
      await tx.booking.upsert({
        where: { id: b.id },
        update: {
          bookingCode: b.bookingCode,
          renterId: b.renterId,
          vehicleId: b.vehicleId,
          startDate: b.startDate,
          endDate: b.endDate,
          totalDays: b.totalDays,
          pickupMethod: b.pickupMethod,
          baseAmount: b.baseAmount,
          platformFee: b.platformFee,
          depositAmount: b.depositAmount,
          totalAmount: b.totalAmount,
          status: b.status,
          confirmedAt: b.confirmedAt,
          startedAt: b.startedAt,
          completedAt: b.completedAt,
        },
        create: {
          id: b.id,
          bookingCode: b.bookingCode,
          renterId: b.renterId,
          vehicleId: b.vehicleId,
          startDate: b.startDate,
          endDate: b.endDate,
          totalDays: b.totalDays,
          pickupMethod: b.pickupMethod,
          baseAmount: b.baseAmount,
          platformFee: b.platformFee,
          depositAmount: b.depositAmount,
          totalAmount: b.totalAmount,
          status: b.status,
          confirmedAt: b.confirmedAt,
          startedAt: b.startedAt,
          completedAt: b.completedAt,
        },
      });
    }

    // ==========================================
    // 6. SEED REVIEWS
    // ==========================================
    console.log("➡️ Seeding Reviews...");

    const reviewsData = [
      {
        id: "r-review-01",
        bookingId: "b-booking-01", // Dika renting Avanza
        reviewerId: "u-customer-01", // Dika
        targetId: "u-owner-01", // Andi
        vehicleId: "v-car-01", // Avanza
        target: ReviewTarget.VEHICLE,
        cleanlinessRating: 5,
        accuracyRating: 5,
        communicationRating: 5,
        valueRating: 5,
        overallRating: 5.0,
        comment: "Kondisi Avanza sangat bersih dan wangi, interior mulus. Ownernya ramah dan fast response!",
        isPublished: true,
        publishedAt: new Date("2026-06-13T12:00:00Z"),
      },
      {
        id: "r-review-02",
        bookingId: "b-booking-01",
        reviewerId: "u-owner-01", // Andi Wijaya
        targetId: "u-customer-01", // Dika Pratama
        vehicleId: "v-car-01",
        target: ReviewTarget.RENTER,
        cleanlinessRating: 4,
        accuracyRating: 4,
        communicationRating: 4,
        valueRating: 4,
        overallRating: 4.0,
        comment: "Penyewa yang bertanggung jawab, mobil dikembalikan tepat waktu dalam kondisi bersih.",
        isPublished: true,
        publishedAt: new Date("2026-06-13T13:00:00Z"),
      }
    ];

    for (const r of reviewsData) {
      await tx.review.upsert({
        where: { id: r.id },
        update: r,
        create: r,
      });
    }

    // ==========================================
    // 7. SEED PLATFORM SETTINGS
    // ==========================================
    console.log("➡️ Seeding Platform Settings...");

    const settingsData = [
      {
        id: "ps-01",
        key: "platform_fee_percentage",
        value: "10",
        description: "Platform commission percentage cut from each booking amount",
        updatedBy: "u-admin-01",
      },
      {
        id: "ps-02",
        key: "deposit_percentage",
        value: "30",
        description: "Guarantee deposit percentage security guarantee added to bookings",
        updatedBy: "u-admin-01",
      },
      {
        id: "ps-03",
        key: "late_return_fine_per_hour",
        value: "50000",
        description: "Fee charged to renter per late return hour",
        updatedBy: "u-admin-01",
      },
      {
        id: "ps-04",
        key: "kyc_validity_months",
        value: "12",
        description: "Months kyc verification remains active before expiry",
        updatedBy: "u-admin-01",
      },
      {
        id: "ps-05",
        key: "booking_payment_expiry_hours",
        value: "2",
        description: "Hours before booking expires due to unpaid status",
        updatedBy: "u-admin-01",
      },
      {
        id: "ps-06",
        key: "deposit_release_hours",
        value: "24",
        description: "Hours to automatically release deposit holding",
        updatedBy: "u-admin-01",
      },
      {
        id: "ps-07",
        key: "auto_payout_delay_days",
        value: "1",
        description: "Days before payout is processed to vehicle owners",
        updatedBy: "u-admin-01",
      }
    ];

    for (const ps of settingsData) {
      await tx.platformSetting.upsert({
        where: { id: ps.id },
        update: ps,
        create: ps,
      });
    }

    console.log("✨ Seeding Transaction has successfully finished!");
  });

  console.log("🎉 Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
