import React, { useState } from 'react';
import { Booking, User, Vehicle, DamageReport } from '../types';
import { useLanguage } from '../lib/LanguageContext';
import { 
  Clock, 
  ShieldCheck, 
  Camera, 
  MapPin, 
  MessageSquare, 
  AlertOctagon, 
  History, 
  Calendar, 
  Star, 
  Heart, 
  CheckCircle,
  Gift,
  HelpCircle,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { mockVehicles, mockVouchers } from '../data/mockData';

interface TenantDashboardProps {
  currentUser: User;
  onUpdateKycStatus: (newStatus: any) => void;
  bookings: Booking[];
  wishlist: string[];
  onSelectVehicle: (id: string) => void;
  onOpenChat: (ownerId: string, vehicleId: string) => void;
}

export default function TenantDashboard({
  currentUser,
  onUpdateKycStatus,
  bookings,
  wishlist,
  onSelectVehicle,
  onOpenChat
}: TenantDashboardProps) {
  const { language, t } = useLanguage();
  const [activeSegment, setActiveSegment] = useState<'SEWA' | 'KYC' | 'HISTORY' | 'WISHLIST'>('SEWA');

  // Selfie Checkin State
  const [selfieCheckinCompleted, setSelfieCheckinCompleted] = useState(false);
  const [selfieCheckinPhoto, setSelfieCheckinPhoto] = useState<string | null>(null);
  const [isCapturingSelfie, setIsCapturingSelfie] = useState(false);

  // Damage dispute report state
  const [showDamageForm, setShowDamageForm] = useState(false);
  const [damageDesc, setDamageDesc] = useState('');
  const [damageEstimatedCost, setDamageEstimatedCost] = useState(150000);
  const [damagePhoto, setDamagePhoto] = useState('');
  const [damageReports, setDamageReports] = useState<DamageReport[]>([]);

  // Review state
  const [showReviewForm, setShowReviewForm] = useState<{ [key: string]: boolean }>({});
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewedBookings, setReviewedBookings] = useState<string[]>([]);

  // Cari wishlist vehicles
  const wishlistVehicles = mockVehicles.filter(v => wishlist.includes(v.id));

  // Menentukan countdown virtual sisa waktu pengembalian kendaraan aktif
  const activeBooking = bookings.find(b => b.status === 'DISETUJUI' || b.status === 'AKTIF');

  // Jalankan selfie checkin tiruan
  const handleTriggerSelfie = () => {
    setIsCapturingSelfie(true);
    setTimeout(() => {
      setSelfieCheckinPhoto('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150');
      setSelfieCheckinCompleted(true);
      setIsCapturingSelfie(false);
      alert('Selfie harian Anda berhasil terverifikasi GPS COORD: -6.2088, 106.8456. Mobil aman digunakan.');
    }, 1500);
  };

  // Kirim laporan kerusakan (Dispute deposit)
  const handleSubmitDamageReport = (e: React.FormEvent, bookingId: string) => {
    e.preventDefault();
    const newReport: DamageReport = {
      id: `DMG-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingId: bookingId,
      reportedBy: currentUser.name,
      description: damageDesc,
      photos: [damagePhoto || 'https://images.unsplash.com/photo-1510931557088-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'],
      estimatedCost: damageEstimatedCost,
      status: 'MENUNGGU_MEDIASI',
    };
    setDamageReports([...damageReports, newReport]);
    setShowDamageForm(false);
    setDamageDesc('');
    setDamagePhoto('');
    alert('Laporan sengketa kerusakan berhasil dimasukkan ke moderator. Tim admin akan mengulas klaim deposit ini.');
  };

  // Kirim rating review
  const handleRatingSubmit = (bookingId: string) => {
    setReviewedBookings([...reviewedBookings, bookingId]);
    setShowReviewForm({ ...showReviewForm, [bookingId]: false });
    setReviewComment('');
    alert('Terima kasih atas ulasan pengalaman sewa yang sangat berharga!');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-24 text-left">
      
      {/* COMPACT DASHBOARD HEADER KHUSUS MOBILE / TABLET */}
      <div className="lg:hidden w-full bg-white border border-slate-150 rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full object-cover ring-4 ring-slate-50 flex-shrink-0"
            />
            <div className="text-left min-w-0 flex-1">
              <h2 className="font-extrabold text-slate-900 text-sm sm:text-base truncate">{currentUser.name}</h2>
              <p className="text-[10px] sm:text-xs text-slate-450 font-medium truncate mt-0.5">{currentUser.email}</p>
              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[9px] font-extrabold rounded-lg border border-emerald-100">
                <UserCheck className="w-2.5 h-2.5" />
                <span>KYC {currentUser.kycStatus === 'TERVERIFIKASI' ? (language === 'ID' ? 'TERVERIFIKASI' : 'VERIFIED') : currentUser.kycStatus === 'SEDANG_DITINJAU' ? (language === 'ID' ? 'DITINJAU' : 'UNDER REVIEW') : currentUser.kycStatus}</span>
              </div>
            </div>
          </div>
          
          <div className="w-full sm:w-auto bg-emerald-50/70 border border-emerald-100/60 rounded-2xl p-2.5 sm:p-3 text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1 shrink-0">
            <span className="text-[8px] sm:text-[9px] text-slate-450 font-bold block uppercase tracking-wider leading-none">{language === 'ID' ? 'Poin RentaKu' : 'RentaKu Points'}</span>
            <span className="text-sm font-black text-emerald-700 font-display block mt-0.5">{currentUser.points} {language === 'ID' ? 'Poin' : 'Pts'}</span>
          </div>
        </div>

        {/* Swipeable Tabs Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
          <button
            onClick={() => setActiveSegment('SEWA')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider shrink-0 transition-all ${
              activeSegment === 'SEWA' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{language === 'ID' ? 'Sewa Aktif' : 'Active Rent'}</span>
          </button>
          <button
            onClick={() => setActiveSegment('KYC')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider shrink-0 transition-all ${
              activeSegment === 'KYC' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'ID' ? 'Upload KYC' : 'Upload KYC'}</span>
          </button>
          <button
            onClick={() => setActiveSegment('WISHLIST')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider shrink-0 transition-all ${
              activeSegment === 'WISHLIST' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Wishlist ({wishlist.length})</span>
          </button>
          <button
            onClick={() => setActiveSegment('HISTORY')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider shrink-0 transition-all ${
              activeSegment === 'HISTORY' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{language === 'ID' ? 'Riwayat' : 'History'}</span>
          </button>
        </div>
      </div>

      {/* SIDEBAR DASHBOARD KIRI (HANYA MUNCUL DI DESKTOP / LAYAR LEBAR) */}
      <aside className="hidden lg:block lg:w-1/4 bg-white border border-slate-100 rounded-3xl p-6 self-start space-y-6 shadow-sm sticky top-20">
        <div className="text-center space-y-3 pb-6 border-b border-slate-100">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-16 h-16 rounded-full object-cover mx-auto ring-4 ring-slate-100"
          />
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">{currentUser.name}</h2>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100">
            <UserCheck className="w-3.5 h-3.5" />
            <span>AKUN KYC {currentUser.kycStatus}</span>
          </div>
        </div>

        {/* Menu Navigasi Dashboard */}
        <div className="flex flex-col gap-1 text-slate-600 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveSegment('SEWA')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all ${
              activeSegment === 'SEWA' 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/15' 
                : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Sewa Aktif</span>
          </button>
          <button
            onClick={() => setActiveSegment('KYC')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all ${
              activeSegment === 'KYC' 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/15' 
                : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Unggah Ulang KYC</span>
          </button>
          <button
            onClick={() => setActiveSegment('WISHLIST')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all ${
              activeSegment === 'WISHLIST' 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/15' 
                : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Wishlist ({wishlist.length})</span>
          </button>
          <button
            onClick={() => setActiveSegment('HISTORY')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all ${
              activeSegment === 'HISTORY' 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/15' 
                : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat Rental</span>
          </button>
        </div>

        {/* Profil Poin */}
        <div className="bg-slate-50 rounded-2xl p-4 text-slate-700 text-xs space-y-1.5 font-bold">
          <span className="text-[10px] text-slate-400 block tracking-widest uppercase">Poin Kesetiaan RentaKu</span>
          <div className="text-xl font-extrabold text-slate-900 flex items-center gap-1.5 font-display text-emerald-600">
            {currentUser.points} <span className="text-xs text-slate-400">Poin</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal font-medium">Naikkan poin dengan rajin mengembalikan unit tepat waktu agar mendapat prioritas sewa.</p>
        </div>
      </aside>

      {/* DETIL DASHBOARD KANAN */}
      <main className="flex-1 space-y-8">
        
        {/* SEGMENT 1: SEWA AKTIF DAN COUNTDOWN */}
        {activeSegment === 'SEWA' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-extrabold text-slate-900 text-xl md:text-2xl tracking-tight">Status Sewa Aktif Anda</h2>
              <p className="text-xs text-slate-500">Pantau pergerakan unit sewa, waktu countdown jatuh tempo, dan laporkan jika mengalami kendala.</p>
            </div>

            {/* JIKA TIDAK ADA SEWA AKTIF */}
            {!activeBooking ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
                <div className="bg-slate-100 text-slate-500 w-16 h-16 rounded-full mx-auto flex items-center justify-center">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Tidak Ada Sewa Berjalan</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Saat ini Anda belum menyewa kendaraan apa pun. Rencanakan perjalanan liburan hemat Anda berikutnya sekarang juga!
                </p>
                <button 
                  onClick={() => onSelectVehicle('')}
                  className="bg-emerald-600 text-white text-xs font-bold px-5 py-3 rounded-xl hover:bg-emerald-500 transition-all font-display"
                >
                  Jelajah Katalog Armada
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* CARD DETAIL SEWA AKTIF DENGAN VIRTUAL COUNTDOWN */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex gap-4">
                      <img 
                        src={activeBooking.vehiclePhoto} 
                        alt="" 
                        className="w-20 h-16 rounded-xl object-cover"
                      />
                      <div className="text-left space-y-1">
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-100 border px-2 py-0.5 rounded font-extrabold tracking-wider uppercase leading-none">
                          SUKSES TERBAYAR
                        </span>
                        <h3 className="font-extrabold text-slate-950 text-base sm:text-lg leading-tight">{activeBooking.vehicleName}</h3>
                        <p className="text-[11px] text-slate-400 font-bold">Kode Booking: {activeBooking.id}</p>
                      </div>
                    </div>

                    {/* VIRTUAL COUNTDOWN CLOCK JATUH TEMPO */}
                    <div className="bg-rose-50 border border-rose-150 p-4 rounded-2xl text-left space-y-1 self-stretch flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-rose-500 tracking-wider uppercase">SISA WAKTU KEMBALI</span>
                      <div className="text-lg font-black text-rose-950 flex items-center gap-1.5 font-display">
                        <Clock className="w-5 h-5 text-rose-600 animate-pulse" />
                        <span>32 Jam : 45 Menit</span>
                      </div>
                    </div>
                  </div>

                  {/* VIRTUAL SELFIE CHECK-IN HOOK (PENCEGAH PENCURIAN SENGKETA) */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-150 flex flex-col sm:flex-row justify-between items-center gap-5">
                    <div className="text-left space-y-2 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-rose-500 rounded-full animate-ping"></span>
                        <h4 className="font-extrabold text-xs text-rose-800 uppercase tracking-wider">Selfie Check-in Harian Wajib!</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        Guna mematuhi klausul keamanan anti-penggelapan sewa, harap unggah foto kecocokan muka dengan dasbor mobil Anda setiap 24 jam sekali.
                      </p>
                    </div>

                    <div>
                      {selfieCheckinCompleted ? (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold">
                          <CheckCircle className="w-4 h-4" />
                          <span>SUKSES CHECK-IN</span>
                        </div>
                      ) : (
                        <button
                          onClick={handleTriggerSelfie}
                          disabled={isCapturingSelfie}
                          className="bg-emerald-600 text-white font-extrabold text-xs px-5 py-3 rounded-xl hover:bg-emerald-500 transition-all flex items-center gap-2"
                        >
                          <Camera className="w-4.5 h-4.5" />
                          <span>{isCapturingSelfie ? 'Mengolah Wajah...' : 'Ambil Selfie Dasbor'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* DETIL HARGA & PERSYARATAN */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-slate-500 pt-5 border-t border-slate-50 text-left">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold leading-normal mb-0.5 uppercase tracking-wider">TANGGAL MULAI</span>
                      <strong className="text-slate-800">{activeBooking.startDate}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold leading-normal mb-0.5 uppercase tracking-wider">TANGGAL BERAKHIR</span>
                      <strong className="text-slate-800">{activeBooking.endDate}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold leading-normal mb-0.5 uppercase tracking-wider">DEPOSIT DI-HOLD</span>
                      <strong className="text-slate-850 font-bold">Rp {activeBooking.depositAmount.toLocaleString('id-ID')}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold leading-normal mb-0.5 uppercase tracking-wider">AKAD DIGITAL</span>
                      <strong className="text-emerald-700 font-extrabold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> SIGNED
                      </strong>
                    </div>
                  </div>

                  {/* Lapor Masalah / Kerusakan Darurat (Deposit Dispute Claim) */}
                  <div className="pt-6 border-t border-slate-50 flex flex-wrap gap-3">
                    <button
                      onClick={() => onOpenChat(activeBooking.ownerId, activeBooking.vehicleId)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4 text-slate-600" /> Hubungi Owner
                    </button>
                    
                    <a
                      href="https://wa.me/6281385507712?text=Halo%20Host%20RentaKu%2C%20saya%20ingin%20menanyakan%20perihal%20sewa%20aktif%20saya."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5 fill-current text-emerald-600" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span>WhatsApp Owner</span>
                    </a>
                    <button
                      onClick={() => setShowDamageForm(!showDamageForm)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 border border-rose-100 ml-auto"
                    >
                      <AlertOctagon className="w-4 h-4 text-rose-600" /> Laporkan Kerusakan / Sengketa Deposit
                    </button>
                  </div>
                </div>

                {/* DAMAGE REPORT FORM MODAL DISPUTE */}
                {showDamageForm && (
                  <form onSubmit={(e) => handleSubmitDamageReport(e, activeBooking.id)} className="bg-white border border-rose-200 p-6 rounded-3xl space-y-4 animate-in fade-in slide-in-from-top-3">
                    <div className="text-left space-y-1">
                      <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                        <AlertOctagon className="w-4.5 h-4.5 text-rose-600" /> Formulir Penyelesaian Sengketa Deposit Kerusakan
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Bila unit mengalami goresan, kecelakaan, atau benturan di jalan nirlaba, laporkan detailnya di bawah beserta taksiran bukti foto agar sengketa deposit ditangani seadil-adilnya oleh Tim Mediasi RentaKu Partner.
                      </p>
                    </div>

                    <div className="space-y-4 text-xs font-semibold text-slate-700">
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Uraian Kronologi Kejadian</label>
                        <textarea 
                          rows={3}
                          value={damageDesc}
                          onChange={(e) => setDamageDesc(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold focus:outline-none"
                          placeholder="Ceritakan kejadian di jalan, nama jalan, rincian baret atau penyok mobil..."
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taksiran Biaya Perbaikan Bengkel (Rp)</label>
                          <input 
                            type="number" 
                            value={damageEstimatedCost}
                            onChange={(e) => setDamageEstimatedCost(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                            required
                          />
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Foto Bukti Kerusakan (URL)</label>
                          <input 
                            type="text" 
                            value={damagePhoto}
                            onChange={(e) => setDamagePhoto(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                            placeholder="https://images.unsplash.com/..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setShowDamageForm(false)}
                        className="text-xs text-slate-400 hover:text-slate-900 border border-slate-200 px-4 py-2 rounded-xl"
                      >
                        Batalkan
                      </button>
                      <button 
                        type="submit"
                        className="bg-rose-700 text-white font-extrabold text-xs px-5 py-2 rounded-xl hover:bg-rose-600 transition-all"
                      >
                        Kirim Laporan Mediasi
                      </button>
                    </div>
                  </form>
                )}

                {/* SENGKETA AKTIF TAMPILAN */}
                {damageReports.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1">Log Kasus Kerusakan Terlapor</h4>
                    {damageReports.map((report) => (
                      <div key={report.id} className="bg-white border rounded-2xl p-4 flex justify-between items-center text-xs">
                        <div className="text-left space-y-1">
                          <span className="bg-amber-100 text-[9px] text-amber-800 font-extrabold px-1.5 py-0.5 rounded uppercase">MEDIASI AKTIF</span>
                          <h5 className="font-extrabold text-slate-800">{report.id} • Taksiran Biaya Perbaikan Rp {report.estimatedCost.toLocaleString('id-ID')}</h5>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{report.description}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">Menunggu keputusan pihak ke-3</span>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* SEGMENT 2: UNGGU KASUS KYC YANG JELAS */}
        {activeSegment === 'KYC' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="space-y-1">
              <h2 className="font-extrabold text-slate-900 text-xl tracking-tight">Perbarui Dokumen Validasi Kelayakan KYC</h2>
              <p className="text-xs text-slate-500">Kredensial Anda dienkripsi tingkat tinggi setara brankas perbankan nirlaba.</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-3 text-xs text-emerald-950 font-semibold leading-relaxed text-left">
                <CheckCircle className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">Status KYC Penyewa Aktif: {currentUser.kycStatus}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Identitas utama Anda tervalidasi sukses. Anda bebas sewa unit motor/mobil apa saja tanpa batasan.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 text-xs font-semibold text-slate-700">
                <div className="border rounded-2xl p-4 text-center space-y-3">
                  <Camera className="w-6 h-6 mx-auto text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800 block">KTP Pemohon Utama</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-extrabold">TERUNGGAH SUKSES</span>
                </div>
                <div className="border rounded-2xl p-4 text-center space-y-3">
                  <Camera className="w-6 h-6 mx-auto text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800 block">SIM A / SIM C Pengemudi</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-extrabold">TERUNGGAH SUKSES</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEGMENT 3: WISHLIST MOBIL / MOTOR */}
        {activeSegment === 'WISHLIST' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-extrabold text-slate-900 text-xl tracking-tight">Armada Incaran (Wishlist)</h2>
              <p className="text-xs text-slate-500">Daftar kendaraan impian yang Anda simpan untuk rencana ke depan.</p>
            </div>

            {wishlistVehicles.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
                <div className="bg-rose-50 text-rose-500 w-16 h-16 rounded-full mx-auto flex items-center justify-center">
                  <Heart className="w-8 h-8 fill-rose-500 text-rose-500" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Belum Ada Wishlist Tersimpan</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Ketuk ikon hati pada halaman katalog atau detail untuk menyimpan mobil kesukaan Anda di sini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wishlistVehicles.map((vehicle) => (
                  <div 
                    key={vehicle.id}
                    onClick={() => onSelectVehicle(vehicle.id)}
                    className="bg-white border rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all text-left flex gap-4 p-4 items-center"
                  >
                    <img src={vehicle.photos[0]} alt="" className="w-24 h-16 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-extrabold text-slate-950 text-sm sm:text-base leading-tight">{vehicle.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{vehicle.location}</p>
                      <strong className="text-xs text-emerald-700 block mt-1">Rp {vehicle.dailyRate.toLocaleString('id-ID')}/hari</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SEGMENT 4: RIWAYAT SEWA SELESAI & REVIEW RATING */}
        {activeSegment === 'HISTORY' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-extrabold text-slate-900 text-xl tracking-tight">Riwayat Transaksi Rental Selesai</h2>
              <p className="text-xs text-slate-500">Berikan ulasan bintang terbaik Anda untuk memotivasi kualitas host partner kami.</p>
            </div>

            {/* Mock selesai sewa past */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="flex gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800"
                  alt="" 
                  className="w-20 h-14 rounded-xl object-cover"
                />
                <div className="text-left space-y-1">
                  <span className="bg-slate-100 text-[9px] text-slate-700 px-1.5 py-0.5 rounded font-extrabold uppercase">
                    SEWA SELESAI
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">Honda HR-V 1.5 SE CVT 2022</h3>
                  <p className="text-[10px] text-slate-400 font-bold">12 Mei 2026 - 15 Mei 2026 • Tarif Rp 1.650.000</p>
                </div>
              </div>

              {/* Form Review Rating */}
              {reviewedBookings.includes('PAST-199') ? (
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  <span>Makasih banyak! Anda sudah berhasil mengulas mobil ini (Bintang 5).</span>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Berikan Ulasan Ke Honda HR-V</span>
                  
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((st) => (
                      <button 
                        key={st} 
                        onClick={() => setReviewStars(st)}
                        className="p-0.5 text-amber-500"
                      >
                        <Star className={`w-5 h-5 ${st <= reviewStars ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>

                  <input 
                    type="text" 
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none text-slate-800"
                    placeholder="Tulis ulasan Anda: suspensi empuk, owner ramah, mobil sangat bersih..."
                  />

                  <button 
                    onClick={() => handleRatingSubmit('PAST-199')}
                    className="bg-slate-900 text-white font-extrabold text-xs px-4 py-2 rounded-xl"
                  >
                    Kirim Ulasan Sekarang
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
