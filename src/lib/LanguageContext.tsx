import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ID' | 'EN';

export const translations = {
  ID: {
    // Nav
    'nav.explore': 'Jelajah',
    'nav.find_vehicle': 'Cari Kendaraan',
    'nav.chats': 'Chat',
    'nav.mode': 'Mode',
    'nav.change_mode': 'Ganti Mode Akses',
    'nav.switch_role': 'Ganti Peran',
    'nav.notification': 'Notifikasi',
    
    // Home Hero
    'hero.badge': 'Platform Rental Nomor #1 dengan Keamanan Berlapis KYC',
    'hero.title': 'Sewa Mobil & Motor Impian Tanpa Khawatir.',
    'hero.subtitle': 'Nikmati transaksi sewa terlindungi asuransi, identitas tervalidasi perbankan, & GPS pelacakan presisi demi rasa aman 24/7.',
    'hero.search_city': 'Lokasi Kota',
    'hero.search_start': 'Sewa Mulai',
    'hero.search_end': 'Selesai Sewa',
    'hero.search_type': 'Tipe Armada',
    'hero.search_btn': 'Cari',
    'hero.all_units': 'Semua Unit',
    'hero.cars': 'Mobil',
    'hero.bikes': 'Motor',
    
    // Home Stats
    'stats.ready': 'Kendaraan Siap',
    'stats.cities': 'Kota Populer',
    'stats.satisfied': 'Penyewa Puas',
    'stats.hidden_fees': 'Biaya Tersembunyi',
    
    // Home Features
    'feat.kyc_title': 'KYC Standar Perbankan',
    'feat.kyc_desc': 'Sistem kecocokan wajah OCR & SIM otomatis.',
    'feat.gps_title': 'Pelacak GPS Real-Time',
    'feat.gps_desc': 'Semua armada terpasang GPS super akurat gratis.',
    'feat.insurance_title': 'Asuransi Penuh',
    'feat.insurance_desc': 'Melindungi perjalanan Anda dari segala risiko minor.',
    'feat.dispute_title': 'Penengah Sengketa',
    'feat.dispute_desc': 'Sistem klaim deposit aman ditengahi Admin 24 jam.',
    
    // Recommendations
    'recom.title': 'Rekomendasi Armada Terpopuler',
    'recom.subtitle': 'Nikmati kemudahan berkendara dengan armada terlaris, terpantau GPS aman.',
    'recom.view_all': 'Lihat Semua',
    
    // Vouchers
    'promo.title': 'Kupon & Voucher Hemat RentaKu',
    'promo.subtitle': 'Salin kode promo eksklusif untuk mendapatkan potongan harga spesial sewa Anda.',
    'promo.copy': 'Salin',
    'promo.copied': 'Disalin!',
    'promo.used': 'Digunakan',
    
    // Footer & Call to Action
    'cta.title': 'Daftar & Lewati KYC',
    'cta.subtitle': 'Unggah dokumen identitas Anda satu kali, nikmati persewaan cepat berulang-ulang tanpa ribet verifikasi ulang.',
    'cta.btn': 'Daftar Sekarang',
    'footer.desc': 'Platform web persewaan mobil & motor terverifikasi nomor #1 untuk pasar Indonesia. Menggunakan enkripsi KYC nirlaba serta pelacak darurat GPS nirkabel.',
    
    // Catalog View
    'catalog.title': 'Katalog Armada Terverifikasi',
    'catalog.subtitle': 'Saring kendaraan berdasarkan tipe, kota, dan ketersediaan real-time.',
    'catalog.search_placeholder': 'Cari nama kendaraan (contoh: Innova, Nmax)...',
    'catalog.sort': 'Urutkan',
    'catalog.sort.lowest': 'Harga Terendah',
    'catalog.sort.highest': 'Harga Tertinggi',
    'catalog.sort.rating': 'Rating Tertinggi',
    'catalog.type': 'Tipe Kendaraan',
    'catalog.city': 'Kota',
    'catalog.available': 'Tersedia',
    'catalog.booked': 'Terbooking',
    'catalog.daily': 'hari',
    'catalog.monthly': 'bulan',
    'catalog.details': 'Detail Unit',
    
    // Detail View
    'detail.title': 'Spesifikasi & Detail Unit',
    'detail.back': 'Kembali',
    'detail.owner': 'Pemilik Unit',
    'detail.verified': 'Terverifikasi',
    'detail.features': 'Fitur Utama Armada',
    'detail.gps_note': 'Detail peta koordinat GPS akurat akan dibagikan sesaat setelah booking Anda tervalidasi sukses.',
    'detail.cancellation': 'Kebijakan Pengembalian & Pembatalan',
    'detail.cancel_desc': 'Pembatalan gratis hingga 24 jam sebelum sewa dimulai. Pengembalian deposit penuh tanpa potongan.',
    'detail.checkout_card': 'Rincian Sewa Anda',
    'detail.duration': 'Durasi Sewa',
    'detail.driver_option': 'Opsi Sopir / Pengemudi',
    'detail.no_driver': 'Sewa Lepas Kunci (Tanpa Driver)',
    'detail.with_driver': 'Gunakan Sopir Tambahan (+ Rp 150.000 / hari)',
    'detail.summary': 'Ringkasan Biaya',
    'detail.base_price': 'Harga Sewa Dasar',
    'detail.deposit': 'Jaminan Deposit (Refundable)',
    'detail.security_badge': 'Proses checkout ini dilindungi enkripsi Midtrans SSL, asuransi penuh RentaKu, perlindungan data KYC terenkripsi aman.',
    'detail.kyc_alert': 'Dokumen KYC Anda belum Terverifikasi. Silakan upload dokumen KYC Anda terlebih dahulu sebelum konfirmasi sisa pemesanan.',
    'detail.book_now': 'Pesan Sekarang',
    
    // Booking Wizard
    'wizard.step1': 'Jadwal & Waktu',
    'wizard.step2': 'Layanan Tambahan',
    'wizard.step3': 'Verifikasi KYC',
    'wizard.step4': 'Selesai',
    'wizard.step2_title': 'Layanan Tambahan (Add-on)',
    'wizard.step2_desc': 'Lengkapi kebutuhan perjalanan sewa Anda agar lebih nyaman & tanpa repot.',
    'wizard.gps_obligatory_title': 'Fitur Wajib Standar Keamanan: GPS Tracker Super Akurat',
    'wizard.gps_obligatory_badge': 'Aktif Otomatis & Gratis',
    'wizard.gps_obligatory_desc': 'Modul GPS Tracker Real-time Super Akurat terpasang & aktif 24/7 di semua unit armada RentaKu tanpa dikenakan tarif sewa (Rp 0). Demi keamanan penuh penyewa dan pemilik kendaraan, fitur pelacakan ini wajib aktif di setiap transaksi.',
    'wizard.optional_addons': 'Opsi Layanan Tambahan Sukarela',
    'wizard.rate_flat': 'Tarif: Rp {price} (Flat Sekali Transaksi)',
    'wizard.rate_daily': 'Tarif: Rp {price} /hari x {days} Hari',
    'wizard.next': 'Lanjutkan',
    'wizard.prev': 'Kembali',
    
    // Chat System
    'chat.kyc_profiles': 'Profil KYC Terverifikasi',
    'chat.verified_accounts': '2 AKUN VERIFIED',
    'chat.click_to_reply': 'Klik kartu profil di bawah untuk bertukar peran membalas chat!',
    'chat.active': 'Aktif',
    'chat.reply_guide': 'Saling Balas Seperti FB Marketplace',
  },
  EN: {
    // Nav
    'nav.explore': 'Explore',
    'nav.find_vehicle': 'Find Vehicle',
    'nav.chats': 'Chats',
    'nav.mode': 'Mode',
    'nav.change_mode': 'Change Access Mode',
    'nav.switch_role': 'Switch Role',
    'nav.notification': 'Notifications',
    
    // Home Hero
    'hero.badge': '#1 Rental Platform with Tiered KYC Protection',
    'hero.title': 'Rent Your Dream Car & Bike Worry-Free.',
    'hero.subtitle': 'Enjoy secure rentals protected by comprehensive insurance, bank-grade identity verification, and 24/7 high-precision GPS tracking.',
    'hero.search_city': 'City Location',
    'hero.search_start': 'Start Date',
    'hero.search_end': 'End Date',
    'hero.search_type': 'Fleet Type',
    'hero.search_btn': 'Search',
    'hero.all_units': 'All Units',
    'hero.cars': 'Cars',
    'hero.bikes': 'Bikes',
    
    // Home Stats
    'stats.ready': 'Ready Vehicles',
    'stats.cities': 'Popular Cities',
    'stats.satisfied': 'Happy Renters',
    'stats.hidden_fees': 'Hidden Fees',
    
    // Home Features
    'feat.kyc_title': 'Bank-Grade KYC',
    'feat.kyc_desc': 'Automated OCR face matching and license validation.',
    'feat.gps_title': 'Real-Time GPS Tracking',
    'feat.gps_desc': 'High-precision GPS pre-installed on all vehicles for free.',
    'feat.insurance_title': 'Full Insurance',
    'feat.insurance_desc': 'Protects your journey against minor and major damages.',
    'feat.dispute_title': 'Dispute Mediator',
    'feat.dispute_desc': 'Secure deposit claims mediated by admin 24/7.',
    
    // Recommendations
    'recom.title': 'Most Popular Fleets',
    'recom.subtitle': 'Enjoy seamless driving with top-selling fleets, monitored securely with GPS.',
    'recom.view_all': 'View All',
    
    // Vouchers
    'promo.title': 'RentaKu Deals & Coupons',
    'promo.subtitle': 'Copy exclusive promo codes to get extra discounts on your rentals.',
    'promo.copy': 'Copy',
    'promo.copied': 'Copied!',
    'promo.used': 'Used',
    
    // Footer & Call to Action
    'cta.title': 'Register & Bypass Manual KYC',
    'cta.subtitle': 'Upload your identity documents once, enjoy instant rentals with automated background checks.',
    'cta.btn': 'Register Now',
    'footer.desc': '#1 verified car & motorbike rental web platform for the Indonesian market. Utilizing modern KYC encryption and secure wireless GPS trackers.',
    
    // Catalog View
    'catalog.title': 'Verified Vehicle Catalog',
    'catalog.subtitle': 'Filter vehicles by type, location, and real-time availability.',
    'catalog.search_placeholder': 'Search vehicles (e.g. Innova, Nmax)...',
    'catalog.sort': 'Sort By',
    'catalog.sort.lowest': 'Lowest Price',
    'catalog.sort.highest': 'Highest Price',
    'catalog.sort.rating': 'Highest Rating',
    'catalog.type': 'Vehicle Type',
    'catalog.city': 'City',
    'catalog.available': 'Available',
    'catalog.booked': 'Booked',
    'catalog.daily': 'day',
    'catalog.monthly': 'month',
    'catalog.details': 'Details',
    
    // Detail View
    'detail.title': 'Fleet Specifications & Details',
    'detail.back': 'Back',
    'detail.owner': 'Owner',
    'detail.verified': 'Verified',
    'detail.features': 'Key Features',
    'detail.gps_note': 'Accurate GPS map coordinates will be shared instantly once your booking is successfully validated.',
    'detail.cancellation': 'Cancellation & Refund Policy',
    'detail.cancel_desc': 'Free cancellation up to 24 hours before renting starts. Full deposit refund without deduction.',
    'detail.checkout_card': 'Your Rent Details',
    'detail.duration': 'Rental Duration',
    'detail.driver_option': 'Driver Service Options',
    'detail.no_driver': 'Self-Drive (No Driver)',
    'detail.with_driver': 'Use Professional Driver (+ Rp 150,000 / day)',
    'detail.summary': 'Price Summary',
    'detail.base_price': 'Base Rent Price',
    'detail.deposit': 'Refundable Guarantee Deposit',
    'detail.security_badge': 'This checkout process is protected by Midtrans SSL encryption, full insurance, and encrypted secure KYC data.',
    'detail.kyc_alert': 'Your KYC documents are not verified yet. Please upload them first before confirming the booking.',
    'detail.book_now': 'Book Now',
    
    // Booking Wizard
    'wizard.step1': 'Dates & Time',
    'wizard.step2': 'Add-ons',
    'wizard.step3': 'KYC Gate',
    'wizard.step4': 'Receipt',
    'wizard.step2_title': 'Optional Add-on Services',
    'wizard.step2_desc': 'Upgrade your journey with customized services for absolute convenience.',
    'wizard.gps_obligatory_title': 'Compulsory Standard Feature: High-Precision GPS Tracker',
    'wizard.gps_obligatory_badge': 'Auto-Active & Free',
    'wizard.gps_obligatory_desc': 'A high-precision real-time GPS tracker is fully pre-installed and activated 24/7 on all RentaKu vehicles for Rp 0. For the ultimate safety of both renters and owners, this is mandatory.',
    'wizard.optional_addons': 'Optional Extras',
    'wizard.rate_flat': 'Rate: Rp {price} (Flat One-Time)',
    'wizard.rate_daily': 'Rate: Rp {price} /day x {days} Days',
    'wizard.next': 'Continue',
    'wizard.prev': 'Back',
    
    // Chat System
    'chat.kyc_profiles': 'KYC Verified Profiles',
    'chat.verified_accounts': '2 ACCOUNTS VERIFIED',
    'chat.click_to_reply': 'Click a profile card below to swap sender role and reply!',
    'chat.active': 'Active',
    'chat.reply_guide': 'Reply back and forth like Facebook Marketplace',
  }
};

type TranslationKey = keyof typeof translations.ID;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, variables?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('rentaku_lang');
    return (saved === 'EN' || saved === 'ID') ? saved : 'ID';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('rentaku_lang', lang);
  };

  const t = (key: TranslationKey, variables?: Record<string, string | number>): string => {
    const dict = translations[language];
    let value = dict[key] || translations['ID'][key] || String(key);
    
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v));
      });
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
