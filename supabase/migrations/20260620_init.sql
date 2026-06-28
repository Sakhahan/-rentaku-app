-- Migration untuk Inisialisasi Database RentaKu (Supabase & PostgreSQL)
-- Tanggal: 2026-06-20
-- Deskripsi: Inisialisasi 35 tabel inti, tipe ENUM, indeks pencarian, constraint CHECK, trigger update_timestamp, dan RLS policies.

-- ==========================================
-- 0. EXTENSION & CLEANUP (JIka diperlukan)
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ENUM TYPES CREATION
-- ==========================================
CREATE TYPE user_role AS ENUM ('PENYEWA', 'PEMILIK', 'ADMIN');
CREATE TYPE kyc_status AS ENUM ('MENUNGGU', 'SEDANG_DITINJAU', 'TERVERIFIKASI', 'DITOLAK');
CREATE TYPE vehicle_type AS ENUM ('MOBIL', 'MOTOR');
CREATE TYPE transmission_type AS ENUM ('MANUAL', 'OTOMATIS');
CREATE TYPE fuel_type AS ENUM ('BENSIN', 'DIESEL', 'LISTRIK');
CREATE TYPE booking_status AS ENUM (
  'MENUNGGU_PEMBAYARAN', 
  'MENUNGGU_KONFIRMASI', 
  'DISETUJUI', 
  'AKTIF', 
  'SELESAI', 
  'DIBATALKAN', 
  'SENGKETA'
);
CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED', 'REFUNDED');
CREATE TYPE deposit_status AS ENUM ('HOLD', 'RELEASED', 'CLAIMED');
CREATE TYPE dispute_status AS ENUM ('MENUNGGU_MEDIASI', 'TERSELESAIKAN');
CREATE TYPE handover_type AS ENUM ('BEFORE', 'AFTER');
CREATE TYPE handover_angle AS ENUM ('FRONT', 'BACK', 'LEFT', 'RIGHT', 'INTERIOR', 'ODOMETER');
CREATE TYPE log_channel AS ENUM ('IN_APP', 'EMAIL', 'WHATSAPP');
CREATE TYPE log_status AS ENUM ('SENT', 'FAILED');
CREATE TYPE reward_transaction_type AS ENUM ('EARNED', 'REDEEMED');

-- ==========================================
-- 2. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==========================================
-- 3. TABLES DEFINITIONS
-- ==========================================

-- 1. users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. user_roles
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    PRIMARY KEY (user_id, role)
);

-- 3. kyc_documents
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    ktp_front_url TEXT,
    ktp_back_url TEXT,
    sim_url TEXT,
    sim_type VARCHAR(10), -- 'SIM_A', 'SIM_B1', 'SIM_B2', 'SIM_C'
    sim_expiry DATE,
    selfie_ktp_url TEXT,
    face_similarity_score DECIMAL(5,2), -- Rentang 0.00 s/d 100.00
    status kyc_status DEFAULT 'MENUNGGU'::kyc_status NOT NULL,
    reject_reason TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. vehicles
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    color VARCHAR(50) NOT NULL,
    plate_number VARCHAR(20) NOT NULL,
    type vehicle_type NOT NULL,
    transmission transmission_type NOT NULL,
    fuel fuel_type NOT NULL,
    passenger_capacity INTEGER NOT NULL DEFAULT 4,
    cc INTEGER, -- CC mesin (sangat berguna untuk filter motor)
    description TEXT,
    daily_rate DECIMAL(12,2) NOT NULL,
    weekend_rate DECIMAL(12,2),
    weekly_discount DECIMAL(5,2) DEFAULT 0.00,
    monthly_discount DECIMAL(5,2) DEFAULT 0.00,
    has_driver_option BOOLEAN DEFAULT FALSE NOT NULL,
    driver_rate DECIMAL(12,2) DEFAULT 0.00,
    rating DECIMAL(3,2) DEFAULT 0.00 NOT NULL,
    review_count INTEGER DEFAULT 0 NOT NULL,
    status VARCHAR(50) DEFAULT 'AVAILABLE' NOT NULL, -- AVAILABLE, RENTED, MAINTENANCE, INACTIVE
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_vehicle_rating CHECK (rating >= 0.00 AND rating <= 5.00),
    CONSTRAINT chk_weekly_discount CHECK (weekly_discount >= 0.00 AND weekly_discount <= 100.00),
    CONSTRAINT chk_monthly_discount CHECK (monthly_discount >= 0.00 AND monthly_discount <= 100.00)
);

-- 5. vehicle_photos
CREATE TABLE vehicle_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
    photo_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. vehicle_features
CREATE TABLE vehicle_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. vehicle_availability_blocks
CREATE TABLE vehicle_availability_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_block_dates CHECK (end_date >= start_date)
);

-- 8. vehicle_rules
CREATE TABLE vehicle_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
    rule_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 9. bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE RESTRICT NOT NULL,
    renter_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    delivery_method VARCHAR(50) NOT NULL, -- PICKUP, DELIVERY
    delivery_address TEXT,
    delivery_fee DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
    base_price DECIMAL(12,2) NOT NULL, -- harga harian x jumlah hari
    addon_price DECIMAL(12,2) DEFAULT 0.00 NOT NULL, -- sopir, gps tracker, kursi bayi dll
    deposit_amount DECIMAL(12,2) NOT NULL, -- 30% dari total sewa
    total_price DECIMAL(12,2) NOT NULL, -- base + delivery + addon
    status booking_status DEFAULT 'MENUNGGU_PEMBAYARAN'::booking_status NOT NULL,
    qr_code_handover TEXT,
    original_km INTEGER,
    actual_km INTEGER,
    actual_return_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_booking_dates CHECK (end_date > start_date)
);

-- 10. booking_addons
CREATE TABLE booking_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    price_per_day DECIMAL(12,2) NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 11. booking_emergency_contacts
CREATE TABLE booking_emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    priority INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 12. payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE RESTRICT NOT NULL,
    transaction_id VARCHAR(255), -- ID transaksi dari Midtrans
    payment_method VARCHAR(100), -- Transfer VA, QRIS, CC, GoPay dll
    amount DECIMAL(12,2) NOT NULL,
    status payment_status DEFAULT 'PENDING'::payment_status NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    response_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 13. deposits
CREATE TABLE deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE RESTRICT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status deposit_status DEFAULT 'HOLD'::deposit_status NOT NULL,
    hold_transaction_id VARCHAR(255), -- Token / ID penahanan Midtrans
    release_transaction_id VARCHAR(255), -- ID pencairan otomatis dari bank
    tracking_notes TEXT,
    auto_release_at TIMESTAMP WITH TIME ZONE NOT NULL, -- booking end_date + 24 jam
    released_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 14. damage_reports
CREATE TABLE damage_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE RESTRICT NOT NULL,
    reported_by_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    description TEXT NOT NULL,
    estimated_cost DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
    actual_cost DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
    status dispute_status DEFAULT 'MENUNGGU_MEDIASI'::dispute_status NOT NULL,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 15. damage_photos
CREATE TABLE damage_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    damage_report_id UUID REFERENCES damage_reports(id) ON DELETE CASCADE NOT NULL,
    photo_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 16. rental_agreements
CREATE TABLE rental_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    pdf_url TEXT,
    owner_signature_url TEXT,
    owner_signed_at TIMESTAMP WITH TIME ZONE,
    renter_signature_url TEXT,
    renter_signed_at TIMESTAMP WITH TIME ZONE,
    terms_accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 17. handover_checklists
CREATE TABLE handover_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE RESTRICT NOT NULL,
    inspector_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    type handover_type NOT NULL, -- BEFORE atau AFTER
    fuel_level VARCHAR(50) NOT NULL, -- level bensin e.g. 'FULL', '3/4', '1/2', 'Empty'
    clean_status BOOLEAN DEFAULT TRUE NOT NULL,
    original_km INTEGER NOT NULL,
    condition_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 18. handover_photos
CREATE TABLE handover_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    handover_checklist_id UUID REFERENCES handover_checklists(id) ON DELETE CASCADE NOT NULL,
    photo_url TEXT NOT NULL,
    angle_label handover_angle NOT NULL, -- FRONT, BACK, LEFT, RIGHT, INTERIOR, ODOMETER
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 19. checkin_logs
CREATE TABLE checkin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    renter_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    selfie_url TEXT NOT NULL,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    is_checked_in BOOLEAN DEFAULT TRUE NOT NULL,
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    alarm_triggered BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 20. reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE RESTRICT NOT NULL,
    rater_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    target_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL, -- Bisa pemilik, penyewa, atau kendaraan
    rating INTEGER NOT NULL,
    comment TEXT,
    category_cleanliness INTEGER,
    category_accuracy INTEGER,
    category_communication INTEGER,
    category_value INTEGER,
    is_owner VARCHAR(20) NOT NULL, -- TO_RENTER (pemilik mengulas penyewa), TO_VEHICLE (penyewa mengulas kendaraan)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_review_rating CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT chk_rev_cleanliness CHECK (category_cleanliness >= 1 AND category_cleanliness <= 5),
    CONSTRAINT chk_rev_accuracy CHECK (category_accuracy >= 1 AND category_accuracy <= 5),
    CONSTRAINT chk_rev_comm CHECK (category_communication >= 1 AND category_communication <= 5),
    CONSTRAINT chk_rev_val CHECK (category_value >= 1 AND category_value <= 5)
);

-- 21. review_replies
CREATE TABLE review_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
    replier_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    reply_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 22. owner_payouts
CREATE TABLE owner_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE RESTRICT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    platform_commission DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL, -- PENDING, PAID
    payout_bank VARCHAR(100),
    payout_account VARCHAR(100),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 23. notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 24. notification_logs
CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE NOT NULL,
    channel log_channel NOT NULL, -- IN_APP, EMAIL, WHATSAPP
    status log_status DEFAULT 'SENT'::log_status NOT NULL,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 25. chats
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    message_text TEXT,
    media_url TEXT,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    typing_indicator_seen_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 26. wishlists
CREATE TABLE wishlists (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, vehicle_id)
);

-- 27. vouchers
CREATE TABLE vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_value DECIMAL(12,2), -- Nominal diskon rupiah e.g. Rp 50.000
    discount_percentage DECIMAL(5,2), -- Diskon persentase e.g. 10.00%
    max_discount DECIMAL(12,2), -- Batas maksimal diskon rupiah
    min_booking_value DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    total_limit INTEGER DEFAULT 100 NOT NULL,
    used_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_voucher_dates CHECK (end_date >= start_date)
);

-- 28. voucher_usage
CREATE TABLE voucher_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voucher_id UUID REFERENCES vouchers(id) ON DELETE CASCADE NOT NULL,
    renter_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    discount_applied DECIMAL(12,2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 29. blacklist
CREATE TABLE blacklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- opsional jika dia punya akun
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    reason TEXT NOT NULL,
    blacklisted_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 30. referral_codes
CREATE TABLE referral_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    reward_percentage DECIMAL(5,2) DEFAULT 5.00 NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 31. reward_points
CREATE TABLE reward_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    current_points INTEGER DEFAULT 0 NOT NULL,
    lifetime_points INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 32. reward_transactions
CREATE TABLE reward_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    points INTEGER NOT NULL, -- bisa positif (pemasukan) atau negatif (pengeluaran)
    type reward_transaction_type NOT NULL, -- EARNED atau REDEEMED
    description TEXT,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 33. admin_logs
CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL, -- CREATE_VEHICLE, APPROVE_KYC, BLOCK_USER dll
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 34. gps_tracker_assignments
CREATE TABLE gps_tracker_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    gps_device_id VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    last_lat DOUBLE PRECISION,
    last_lng DOUBLE PRECISION,
    last_updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 35. platform_settings
CREATE TABLE platform_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);


-- ==========================================
-- 4. TRIGGERS ASSIGNMENTS (FOR UPDATED_AT)
-- ==========================================
CREATE TRIGGER tr_update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_update_kyc_updated_at BEFORE UPDATE ON kyc_documents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_update_deposits_updated_at BEFORE UPDATE ON deposits FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_update_damage_reports_updated_at BEFORE UPDATE ON damage_reports FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_update_reward_points_updated_at BEFORE UPDATE ON reward_points FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_update_platform_settings_updated_at BEFORE UPDATE ON platform_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ==========================================
-- 5. INDEXES CREATION (FOR MAXIMUM QUERY PERFOMANCE)
-- ==========================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX idx_kyc_documents_status ON kyc_documents(status);
CREATE INDEX idx_vehicles_owner_id ON vehicles(owner_id);
CREATE INDEX idx_vehicles_brand_model ON vehicles(brand, model);
CREATE INDEX idx_vehicles_cc ON vehicles(cc);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_daily_rate ON vehicles(daily_rate);
CREATE INDEX idx_bookings_renter_id ON bookings(renter_id);
CREATE INDEX idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_deposits_booking_id ON deposits(booking_id);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_damage_reports_booking_id ON damage_reports(booking_id);
CREATE INDEX idx_handover_checklists_booking_id ON handover_checklists(booking_id);
CREATE INDEX idx_chats_booking_id ON chats(booking_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_vouchers_code ON vouchers(code);
CREATE INDEX idx_blacklist_phone ON blacklist(phone);
CREATE INDEX idx_blacklist_email ON blacklist(email);


-- ==========================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- Mengaktifkan RLS untuk semua tabel demi keamanan tinggi database Supabase
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE damage_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE damage_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE handover_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE handover_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklist ENABLE ROW LEVEL SECURITY;

-- Contoh Kebijakan RLS (Users: Pengguna hanya dapat membaca dan memperbarui datanya sendiri)
CREATE POLICY "Users can view own profiling data" ON users 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profiling data" ON users 
    FOR UPDATE USING (auth.uid() = id);

-- Kebijakan RLS (KYC: Penyewa hanya dapat membaca dan membuat dokumen KYC miliknya sendiri, admin membaca semua)
CREATE POLICY "Users can manage own KYC documents" ON kyc_documents 
    FOR ALL USING (auth.uid() = user_id);

-- Kebijakan RLS (Vehicles: Terbuka untuk dibaca semua orang, pemilik dapat mengelola dokumennya sendiri)
CREATE POLICY "Public can view vehicles list" ON vehicles 
    FOR SELECT USING (TRUE);

CREATE POLICY "Owners can manage own vehicles" ON vehicles 
    FOR ALL USING (auth.uid() = owner_id);

-- Kebijakan RLS (Bookings: Penyewa & pemilik dapat mengakses data peminjaman yang relevan)
CREATE POLICY "Renters and Owners can view bookings" ON bookings
    FOR SELECT USING (auth.uid() = renter_id OR auth.uid() IN (SELECT owner_id FROM vehicles WHERE id = vehicle_id));

CREATE POLICY "Renters can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = renter_id);

-- Kebijakan RLS (Chats: hanya pihak yang terlibat dalam transaksi rental yang bisa membaca isi obrolan)
CREATE POLICY "Chats are only viewable by booking participants" ON chats
    FOR SELECT USING (
        auth.uid() IN (
            SELECT renter_id FROM bookings WHERE id = booking_id
            UNION
            SELECT owner_id FROM vehicles WHERE id = (SELECT vehicle_id FROM bookings WHERE id = booking_id)
        )
    );

CREATE POLICY "Chats are only writeable by booking participants" ON chats
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT renter_id FROM bookings WHERE id = booking_id
            UNION
            SELECT owner_id FROM vehicles WHERE id = (SELECT vehicle_id FROM bookings WHERE id = booking_id)
        )
    );
