import React, { useState } from 'react';
import { Vehicle, User } from '../types';
import { 
  Star, 
  MapPin, 
  ShieldCheck, 
  Calendar as CalendarIcon, 
  User as UserIcon, 
  MessageSquare, 
  ChevronRight,
  Heart,
  Car,
  Fuel,
  Settings,
  Flame,
  CheckCircle,
  HelpCircle,
  Info
} from 'lucide-react';

interface DetailViewProps {
  vehicle: Vehicle;
  currentUser: User;
  onStartBooking: (vehicleId: string, options: any) => void;
  onBackToCatalog: () => void;
  onOpenChat: (ownerId: string, vehicleId: string) => void;
  wishlist: string[];
  onAddToWishlist: (vehicleId: string) => void;
}

export default function DetailView({
  vehicle,
  currentUser,
  onStartBooking,
  onBackToCatalog,
  onOpenChat,
  wishlist,
  onAddToWishlist
}: DetailViewProps) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [withDriver, setWithDriver] = useState(false);
  const [startDate, setStartDate] = useState('2026-06-25');
  const [endDate, setEndDate] = useState('2026-06-28');

  const isInWishlist = wishlist.includes(vehicle.id);

  // Hitung durasi hari
  const calculateDays = () => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const days = calculateDays();

  // Hitung harga rincian
  const dailyRate = vehicle.dailyRate;
  const baseTotal = dailyRate * days;
  const driverCost = withDriver ? vehicle.driverRate * days : 0;
  
  // Diskon sewa
  let discountPercentage = 0;
  if (days >= 30) discountPercentage = vehicle.monthlyDiscount;
  else if (days >= 7) discountPercentage = vehicle.weeklyDiscount;

  const discountAmount = (baseTotal * discountPercentage) / 100;
  const depositAmount = (baseTotal - discountAmount) * 0.30; // 30% deposit jaminan
  const finalTotal = baseTotal + driverCost + 50000 - discountAmount; // Biaya layanan tetap Rp 50.000

  return (
    <div className="pb-24 text-left">
      {/* Back Button */}
      <button 
        onClick={onBackToCatalog}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 group transition-all"
      >
        <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-all" /> Kembali Ke Katalog
      </button>

      {/* Grid Header Info */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight leading-none">{vehicle.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-semibold mt-3">
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-4.5 h-4.5 fill-amber-500" /> {vehicle.rating.toFixed(2)} ({vehicle.reviewCount} Ulasan)
            </span>
            <span>•</span>
            <span className="flex items-center gap-0.5"><MapPin className="w-4 h-4 text-emerald-600" /> {vehicle.location}</span>
            <span>•</span>
            <span className="bg-emerald-50 text-emerald-800 border-emerald-100 border px-2 py-0.5 rounded text-[10px] font-bold">PEMILIK TERVERIFIKASI</span>
          </div>
        </div>

        {/* Wishlist & Share buttons */}
        <div className="flex gap-2">
          <button 
            onClick={() => onAddToWishlist(vehicle.id)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-bold transition-all text-slate-700"
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{isInWishlist ? 'Disimpan' : 'Wishlist'}</span>
          </button>
        </div>
      </div>

      {/* GALLERY FOTO (Pinterest Style Gallery Grid) */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 h-[400px]">
        {/* Main large photo */}
        <div className="md:col-span-2 relative h-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
          <img 
            src={vehicle.photos[activePhoto]} 
            alt={vehicle.name} 
            className="w-full h-full object-cover transition-all"
          />
        </div>

        {/* Right smaller thumbnails */}
        <div className="hidden md:grid grid-cols-2 col-span-2 gap-4 h-full">
          {vehicle.photos.map((ph, idx) => (
            <div 
              key={idx} 
              onClick={() => setActivePhoto(idx)}
              className={`relative rounded-xl overflow-hidden cursor-pointer bg-slate-50 border-2 transition-all ${
                activePhoto === idx ? 'border-emerald-500 scale-95 shadow-lg' : 'border-slate-100 hover:border-slate-300'
              }`}
            >
              <img src={ph} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          {/* Mock empty photo slot for total of 4-6 required */}
          <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 p-4">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold block">Tampak Sisi Lain</span>
              <span className="text-[10px]">Tervalidasi RentaKu</span>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 p-4">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold block bg-emerald-600 text-white rounded px-1.5 py-0.5">360° View</span>
              <span className="text-[10px]">Interaktif AR/VR VR-Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* TWO COLUMNS LAYOUT: DETAILS vs BOOKING SIDEBAR */}
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* LEFT COLUMN: FEATURES & REVIEWS */}
        <div className="flex-1 space-y-10">
          
          {/* Spesifikasi Kendaraan */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-xl">Spesifikasi Detail Kendaraan</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-slate-50 text-slate-600 p-2.5 rounded-xl border border-slate-100">
                  <Car className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Merek</span>
                  <span className="text-xs font-bold text-slate-800">{vehicle.brand}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-slate-50 text-slate-600 p-2.5 rounded-xl border border-slate-100">
                  <Fuel className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Bahan Bakar</span>
                  <span className="text-xs font-bold text-slate-800">{vehicle.fuel}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-slate-50 text-slate-600 p-2.5 rounded-xl border border-slate-100">
                  <Settings className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Transmisi</span>
                  <span className="text-xs font-bold text-slate-800">{vehicle.transmission}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-slate-50 text-slate-600 p-2.5 rounded-xl border border-slate-100">
                  <Flame className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Kapasitas Mesin</span>
                  <span className="text-xs font-bold text-slate-800">{vehicle.cc ? `${vehicle.cc} CC` : '-'}</span>
                </div>
              </div>
            </div>

            {/* Spek Lengkap Detail */}
            <div className="grid grid-cols-2 gap-4 pt-5 border-t border-slate-50 text-slate-600 text-xs font-medium">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span>Model Kendaraan</span>
                <strong className="text-slate-900">{vehicle.model}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span>Tahun Registrasi</span>
                <strong className="text-slate-900">{vehicle.year}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span>Warna Bodi</span>
                <strong className="text-slate-900">{vehicle.color}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span>Nomor Plat Polisi</span>
                <strong className="text-slate-900 font-mono tracking-wide">{vehicle.plateNumber.replace(/\w{4}$/, '****')} (Disamarkan)</strong>
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 text-xl">Ulasan Deskripsi</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">{vehicle.description}</p>
          </div>

          {/* Fitur yang Tersedia */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-xl">Fasilitas & Fitur Unit</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vehicle.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-3 text-slate-700 text-sm font-semibold">
                  <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Aturan Rental Khusus */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-rose-800 text-lg sm:text-xl flex items-center gap-2">Aturan Sewa (Wajib Dipatuhi)</h3>
            <div className="space-y-2 border border-rose-100 bg-rose-50/50 rounded-2xl p-5 text-xs text-rose-950 font-semibold leading-relaxed">
              {vehicle.rules.map((rule, idx) => (
                <div key={idx} className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-700 mt-1.5 flex-shrink-0"></span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Profil Pemilik / Host */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <img
                src={vehicle.ownerAvatar}
                alt={vehicle.ownerName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase">HOST / PENYEDIA UNIT</span>
                <h4 className="font-extrabold text-slate-900 text-lg leading-none">{vehicle.ownerName}</h4>
                <div className="flex items-center gap-2 text-xs text-amber-500 font-bold mt-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500" /> {vehicle.ownerRating} Rating • Respon 100% • Bergabung Sejak 2024
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => onOpenChat(vehicle.ownerId, vehicle.id)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-3 rounded-xl transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-slate-600" /> Tanya Host (Chat)
              </button>
              
              <a
                href="https://wa.me/6281385507712?text=Halo%20Host%20RentaKu%2C%20saya%20tertarik%20dengan%20unit%20sewa%20kendaraan%20Anda."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold px-4 py-3 rounded-xl transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4 fill-current text-emerald-600" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>Hubungi WA</span>
              </a>
            </div>
          </div>

          {/* Peta Lokasi (Simulasi) */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">Peta Lokasi Pengambilan</h3>
            <div className="relative rounded-2xl overflow-hidden h-48 sm:h-64 border border-slate-100 shadow-sm bg-blue-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-cover bg-center filter opacity-40 select-none pointer-events-none" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800")' }}></div>
              <div className="relative bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-indigo-100 text-center space-y-2 max-w-sm z-20">
                <div className="bg-indigo-100 text-indigo-700 w-10 h-10 rounded-full mx-auto flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-slate-800">Unit Berada di Cabang: {vehicle.location}</h4>
                <p className="text-[10px] text-slate-500">Detail peta koordinat GPS akurat akan dibagikan sesaat setelah booking Anda tervalidasi sukses.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY BOOKING WIDGET */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl space-y-6 sticky top-24 self-start">
            
            {/* Price Header */}
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-400">Tarif Harian</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-950 font-display">
                  Rp {dailyRate.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-slate-400 font-medium">/hari</span>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4 border-t border-slate-50 pt-5 text-left">
              
              {/* Tanggal Mulai & Akhir */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">MULAI SEWA</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full bg-transparent font-bold text-slate-800 text-xs focus:outline-none mt-1" 
                  />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">SELESAI SEWA</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="block w-full bg-transparent font-bold text-slate-800 text-xs focus:outline-none mt-1" 
                  />
                </div>
              </div>

              {/* Driver Option toggle */}
              {vehicle.hasDriverOption && (
                <div className="flex items-center justify-between border border-slate-100 p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 block">Sewa dengan Sopir (Driver)</span>
                    <span className="text-[10px] text-slate-400">Tambah Rp {vehicle.driverRate.toLocaleString('id-ID')}/hari</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={withDriver}
                    onChange={(e) => setWithDriver(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Rincian Kalkulasi Harga */}
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 text-xs font-medium text-slate-600">
              <span className="text-[10px] block font-bold text-slate-400 tracking-wider uppercase mb-1">Rincian Perhitungan</span>
              
              {/* Tarif x Hari */}
              <div className="flex justify-between">
                <span>Tarif Harian ({days} Hari)</span>
                <strong className="text-slate-900">Rp {baseTotal.toLocaleString('id-ID')}</strong>
              </div>

              {/* Driver */}
              {withDriver && (
                <div className="flex justify-between">
                  <span>Sopir Pribadi ({days} Hari)</span>
                  <strong className="text-slate-900">Rp {driverCost.toLocaleString('id-ID')}</strong>
                </div>
              )}

              {/* Potongan Diskon Mingguan atau Bulanan */}
              {discountPercentage > 0 && (
                <div className="flex justify-between text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                  <span>Diskon Sewa ({discountPercentage}%)</span>
                  <strong className="font-extrabold">-Rp {discountAmount.toLocaleString('id-ID')}</strong>
                </div>
              )}

              {/* Deposit Keamanan disorot */}
              <div className="flex justify-between border-t border-dashed border-slate-200 pt-2.5 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  Uang Deposit Jaminan (30%) <HelpCircle className="w-3.5 h-3.5 text-slate-400" title="Dikembalian utuh dalam 24 jam setelah mobil kembali aman" />
                </span>
                <strong className="text-slate-800 font-bold">Rp {depositAmount.toLocaleString('id-ID')} (Ditahan)</strong>
              </div>

              {/* Administrasi */}
              <div className="flex justify-between">
                <span>Biaya Platform Terlindungi Asuransi</span>
                <strong className="text-slate-900">Rp 50.000</strong>
              </div>

              {/* Final total */}
              <div className="flex justify-between border-t border-slate-200 pt-3 text-sm font-extrabold text-slate-900">
                <span>Grand Total Bayar</span>
                <span className="text-emerald-700">Rp {finalTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* KYC Pre-requirement check alert */}
            {currentUser.kycStatus !== 'TERVERIFIKASI' && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex gap-2 text-[11px] text-amber-900 leading-relaxed font-semibold">
                <Info className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
                <span>Dokumen KYC Anda belum Terverifikasi. Silakan upload dokumen KYC Anda terlebih dahulu sebelum konfirmasi sisa pemesanan.</span>
              </div>
            )}

            {/* Tombol Pesan Sekarang */}
            <button
              onClick={() => onStartBooking(vehicle.id, { withDriver, startDate, endDate, days, finalTotal, depositAmount })}
              className="w-full bg-emerald-600 text-white font-extrabold py-3.5 rounded-2xl hover:bg-emerald-500 transition-all font-display text-sm tracking-wide shadow-lg shadow-emerald-600/15"
            >
              Pesan Instan Langsung
            </button>

            <span className="text-[10px] text-slate-400 text-center block leading-relaxed font-semibold">
              Proses checkout ini dilindungi enkripsi Midtrans SSL, asuransi penuh RentaKu, perlindungan data KYC terenkripsi aman.
            </span>

          </div>
        </div>
      </div>

    </div>
  );
}
