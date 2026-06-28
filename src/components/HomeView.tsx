import React, { useState } from 'react';
import { Vehicle, Voucher } from '../types';
import { useLanguage } from '../lib/LanguageContext';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Car, 
  Bike, 
  ShieldCheck, 
  Users, 
  Clock, 
  Star, 
  Gift, 
  ArrowRight,
  TrendingUp,
  Heart,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { mockVouchers } from '../data/mockData';

interface HomeViewProps {
  vehicles: Vehicle[];
  onSelectVehicle: (id: string) => void;
  onSearch: (filters: any) => void;
  setTab: (tab: string) => void;
  onAddToWishlist: (vehicleId: string) => void;
  wishlist: string[];
}

export default function HomeView({
  vehicles,
  onSelectVehicle,
  onSearch,
  setTab,
  onAddToWishlist,
  wishlist
}: HomeViewProps) {
  const { language, t } = useLanguage();
  const [city, setCity] = useState('Jakarta');
  const [vehicleType, setVehicleType] = useState<'ALL' | 'MOBIL' | 'MOTOR'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const featuredVehicles = vehicles.filter(v => v.isFeatured || v.ownerId !== 'admin');

  const categories = [
    { name: 'SUV', icon: Car, type: 'MOBIL', desc: language === 'ID' ? 'Gagah & Nyaman' : 'Sturdy & Comfortable' },
    { name: 'MPV', icon: Car, type: 'MOBIL', desc: language === 'ID' ? 'Cocok Untuk Keluarga' : 'Family-friendly' },
    { name: 'Sedan', icon: Car, type: 'MOBIL', desc: language === 'ID' ? 'Elegan & Berkelas' : 'Elegant & Classy' },
    { name: 'Motor Matic', icon: Bike, type: 'MOTOR', desc: language === 'ID' ? 'Praktis & Gesit' : 'Practical & Agile' },
    { name: 'Motor Trail', icon: Bike, type: 'MOTOR', desc: language === 'ID' ? 'Tantang Petualangan' : 'Adventurous' },
    { name: 'Motor Sport', icon: Bike, type: 'MOTOR', desc: language === 'ID' ? 'Kecepatan Premium' : 'Premium Speed' }
  ];

  const stats = [
    { value: '1,240+', label: language === 'ID' ? 'Kendaraan Siap' : 'Vehicles Ready', color: 'from-emerald-400 to-teal-500' },
    { value: '18+', label: language === 'ID' ? 'Kota Populer' : 'Popular Cities', color: 'from-emerald-500 to-emerald-600' },
    { value: '98.6%', label: language === 'ID' ? 'Penyewa Puas' : 'Satisfied Renters', color: 'from-emerald-600 to-indigo-600' },
    { value: 'Rp 0', label: language === 'ID' ? 'Biaya Tersembunyi' : 'Hidden Fees', color: 'from-slate-800 to-slate-900' }
  ];

  const promoVouchers = mockVouchers;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ city, vehicleType, startDate, endDate });
    setTab('catalog');
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* HERO SECTION DENGAN SEARCH BAR UTAMA */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-950 text-white py-16 px-6 sm:px-12 lg:px-16 shadow-2xl">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1600")' }}></div>
        <div className="absolute -left-32 -top-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-emerald-400 border border-white/10">
            <Sparkles className="w-4.5 h-4.5" /> {language === 'ID' ? 'Platform Rental Nomor #1 dengan Keamanan Berlapis KYC' : '#1 Rental Platform with Multi-layered KYC Security'}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            {language === 'ID' ? 'Sewa Mobil & Motor Impian Tanpa Khawatir.' : 'Rent Your Dream Car & Bike Without Worries.'}
          </h1>
          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto">
            {language === 'ID' 
              ? 'Nikmati transaksi sewa terlindungi asuransi, identitas tervalidasi perbankan, & GPS pelacakan presisi demi rasa aman 24/7.'
              : 'Enjoy secure rental transactions with insurance protection, bank-validated identity, & precise GPS tracking for 24/7 peace of mind.'
            }
          </p>

          {/* SEARCH BAR WIZARD */}
          <form onSubmit={handleSearchSubmit} className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-full text-slate-800 shadow-2xl flex flex-col lg:flex-row items-center gap-4 border border-slate-100 mt-10">
            {/* Lokasi */}
            <div className="flex items-center gap-3 w-full lg:w-1/4 px-4 py-2 hover:bg-slate-50 rounded-full transition-all border-b lg:border-b-0 lg:border-r border-slate-100">
              <MapPin className="text-emerald-600 w-5 h-5 flex-shrink-0" />
              <div className="text-left w-full">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === 'ID' ? 'Lokasi Kota' : 'City Location'}</label>
                <select 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  className="block w-full bg-transparent font-semibold text-slate-800 text-sm focus:outline-none"
                >
                  <option value="Jakarta">Jakarta (Jabodetabek)</option>
                  <option value="Bandung">Bandung</option>
                  <option value="Bali">Bali (Denpasar)</option>
                  <option value="Surabaya">Surabaya</option>
                  <option value="Yogyakarta">Yogyakarta</option>
                </select>
              </div>
            </div>

            {/* Tanggal Sewa */}
            <div className="flex items-center gap-3 w-full lg:w-1/4 px-4 py-2 hover:bg-slate-50 rounded-full transition-all border-b lg:border-b-0 lg:border-r border-slate-100">
              <Calendar className="text-emerald-600 w-5 h-5 flex-shrink-0" />
              <div className="text-left w-full">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === 'ID' ? 'Mulai Sewa' : 'Start Rent'}</label>
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full bg-transparent font-semibold text-slate-800 text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Selesai Sewa */}
            <div className="flex items-center gap-3 w-full lg:w-1/4 px-4 py-2 hover:bg-slate-50 rounded-full transition-all border-b lg:border-b-0 lg:border-r border-slate-100">
              <Calendar className="text-emerald-600 w-5 h-5 flex-shrink-0" />
              <div className="text-left w-full">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === 'ID' ? 'Selesai Sewa' : 'End Rent'}</label>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full bg-transparent font-semibold text-slate-800 text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Tipe Kendaraan */}
            <div className="flex items-center gap-3 w-full lg:w-1/4 px-4 py-2 hover:bg-slate-50 rounded-full transition-all">
              <Car className="text-emerald-600 w-5 h-5 flex-shrink-0" />
              <div className="text-left w-full">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === 'ID' ? 'Tipe Armada' : 'Fleet Type'}</label>
                <select 
                  value={vehicleType} 
                  onChange={(e) => setVehicleType(e.target.value as any)}
                  className="block w-full bg-transparent font-semibold text-slate-800 text-sm focus:outline-none"
                >
                  <option value="ALL">{language === 'ID' ? 'Semua Unit' : 'All Units'}</option>
                  <option value="MOBIL">{language === 'ID' ? 'Mobil' : 'Cars'}</option>
                  <option value="MOTOR">{language === 'ID' ? 'Motor' : 'Motorcycles'}</option>
                </select>
              </div>
            </div>

            {/* Button Submit */}
            <button 
              type="submit" 
              className="w-full lg:w-auto bg-emerald-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              <span>{language === 'ID' ? 'Cari' : 'Search'}</span>
            </button>
          </form>
        </div>
      </section>

      {/* BADGES KEPERCAYAAN PLATFORM */}
      <section className="-mt-20 relative z-20 max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="flex items-center gap-4 px-4 py-2">
            <div className="bg-emerald-100 text-emerald-700 p-3.5 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">{language === 'ID' ? 'KYC Standar Perbankan' : 'Bank-Grade KYC'}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{language === 'ID' ? 'Sistem kecocokan wajah OCR & SIM otomatis.' : 'OCR face-matching & auto-validated driving licenses.'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 py-2">
            <div className="bg-blue-100 text-blue-700 p-3.5 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">{language === 'ID' ? 'Proteksi Asuransi Jiwa' : 'Life Insurance Protection'}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{language === 'ID' ? 'Setiap perjalanan mendapat rasa tenang ekstra.' : 'Extra peace of mind for every single ride.'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 py-2">
            <div className="bg-amber-100 text-amber-700 p-3.5 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">{language === 'ID' ? 'Dukungan Darurat 24/7' : '24/7 Roadside Support'}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{language === 'ID' ? 'Pendampingan di sela jalanan kapan pun terjadi kendala.' : 'Instant assistance whenever you encounter highway trouble.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* KATEGORI JELAJAH */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1 text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{language === 'ID' ? 'Kategori Pilihan' : 'Featured Categories'}</h2>
            <p className="text-sm text-slate-500">{language === 'ID' ? 'Pilih kendaraan spesifik yang paling pas untuk kenyamanan liburan sewa Anda.' : 'Pick the specific vehicle that best matches your holiday or travel comfort.'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, idx) => (
            <div 
              key={idx} 
              onClick={() => {
                onSearch({ vehicleType: cat.type, category: cat.name });
                setTab('catalog');
              }}
              className="bg-white border border-slate-100 p-5 rounded-2xl hover:border-emerald-500 hover:shadow-lg transition-all text-center cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 mx-auto flex items-center justify-center text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all mb-4">
                <cat.icon className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
              <p className="text-[10px] text-slate-400 mt-1">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* KENDARAAN UNGGULAN/REKOMENDASI (CAROUSEL GRID) */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1 text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <TrendingUp className="text-emerald-600 w-7 h-7" /> Paling Banyak Sewa
            </h2>
            <p className="text-sm text-slate-500">Nikmati kemudahan berkendara dengan armada terlaris, terpantau GPS aman.</p>
          </div>
          <button 
            onClick={() => setTab('catalog')} 
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
          >
            Sewa Unit Lainnya <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.slice(0, 3).map((vehicle) => {
            const isWishlist = wishlist.includes(vehicle.id);
            return (
              <div 
                key={vehicle.id} 
                className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all group flex flex-col justify-between"
              >
                {/* Photo Header */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img 
                    src={vehicle.photos[0]} 
                    alt={vehicle.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-xs font-extrabold text-slate-900 px-3 py-1 rounded-full shadow-sm">
                    {vehicle.location}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToWishlist(vehicle.id);
                    }}
                    className={`absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm transition-all hover:scale-110`}
                  >
                    <Heart className={`w-4.5 h-4.5 ${isWishlist ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
                  </button>

                  <div className="absolute bottom-3 left-3 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md tracking-wider uppercase">
                    PEMILIK TERVERIFIKASI
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
                      <span>{vehicle.type} • {vehicle.transmission}</span>
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> {vehicle.rating.toFixed(2)} ({vehicle.reviewCount})
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg line-clamp-1">{vehicle.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{vehicle.description}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {vehicle.features.slice(0, 2).map((feat, i) => (
                        <span key={i} className="text-[10px] bg-slate-50 border border-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Footer */}
                  <div className="flex items-center justify-between pt-5 border-t border-slate-50 mt-4">
                    <div>
                      <span className="text-[10px] block text-slate-400 font-bold uppercase tracking-wider">Mulai Dari</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-extrabold text-slate-950 font-display">
                          Rp {vehicle.dailyRate.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">/hari</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => onSelectVehicle(vehicle.id)}
                      className="bg-slate-900 group-hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      Sewa Sekarang <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PROMOSI / VOUCHER AKTIF */}
      <section className="bg-emerald-50 rounded-3xl border border-emerald-100 p-6 sm:p-10 space-y-6">
        <div className="space-y-1 text-left">
          <span className="text-[10px] font-extrabold text-emerald-700 tracking-widest uppercase bg-emerald-100/75 px-3 py-1 rounded-full">Kupon / Voucher</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Diskon Hemat RentaKu</h2>
          <p className="text-sm text-emerald-800">Gunakan kode voucher berikut saat melakukan checkout sewa kendaraan Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promoVouchers.map((voucher) => (
            <div key={voucher.code} className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-1.5 text-left">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-50 text-emerald-700 p-2 rounded-lg">
                    <Gift className="w-5 h-5 animate-pulse" />
                  </div>
                  <span className="text-sm font-extrabold text-slate-800 font-mono tracking-wide">{voucher.code}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{voucher.description}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <span className="text-[10px] font-bold text-slate-400">Min. Sewa Rp {voucher.minBookingValue.toLocaleString('id-ID')}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(voucher.code);
                    alert(`Kode voucher "${voucher.code}" berhasil disalin!`);
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Salin Kode
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CARA KERJA (3 LANGKAH MUDAH) */}
      <section className="space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Alur Penyewaan RentaKu</h2>
          <p className="text-sm text-slate-500">Sistem keamanan kelas dunia kami dirancang se-aman, se-amanah, & semudah mungkin bagi kedua belah pihak.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-extrabold text-lg shadow-sm border border-emerald-100 mb-6">
              1
            </div>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">Daftar & Lewati KYC</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Verifikasi KTP, SIM, serta rekam keselarasan wajah untuk validasi identitas hanya dalam 5 menit sebelum memesan.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-extrabold text-lg shadow-sm border border-emerald-100 mb-6">
              2
            </div>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">Booking & Bayar Aman</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Pilih tanggal sewa beserta tambahan driver/gps, bayar instan lunas via Midtrans & tahan 30% deposit jaminan sewa.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-extrabold text-lg shadow-sm border border-emerald-100 mb-6">
              3
            </div>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">Serah Terima Digital</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Lakukan scan QR, tanda tangan kontrak kerja digital, dan potret checklist 6 sudut kondisi kendaraan saat serah terima.
            </p>
          </div>
        </div>
      </section>

      {/* STATISTIK TAMPILAN */}
      <section className="bg-slate-900 rounded-3xl text-white p-10 sm:p-12 shadow-inner">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center space-y-1">
              <span className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r bg-clip-text text-transparent ${stat.color} font-display`}>
                {stat.value}
              </span>
              <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
