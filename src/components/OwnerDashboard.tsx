import React, { useState } from 'react';
import { User, Vehicle, Booking } from '../types';
import { 
  Plus, 
  Car, 
  Bike, 
  DollarSign, 
  Users, 
  TrendingUp, 
  SlidersHorizontal, 
  Check, 
  X, 
  MapPin, 
  Camera, 
  Layers, 
  Cpu, 
  Settings, 
  Grid,
  TrendingDown,
  Trash2
} from 'lucide-react';
import { mockVehicles } from '../data/mockData';

interface OwnerDashboardProps {
  currentUser: User;
  vehicles: Vehicle[];
  bookings: Booking[];
  onAddVehicle: (newVehicle: any) => void;
  onAcceptBooking: (bookingId: string) => void;
  onRejectBooking: (bookingId: string) => void;
  onDeleteVehicle?: (vehicleId: string) => void;
}

export default function OwnerDashboard({
  currentUser,
  vehicles,
  bookings,
  onAddVehicle,
  onAcceptBooking,
  onRejectBooking,
  onDeleteVehicle
}: OwnerDashboardProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  // States form tambah armada
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Toyota');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2022);
  const [color, setColor] = useState('');
  const [plate, setPlate] = useState('');
  const [type, setType] = useState<'MOBIL' | 'MOTOR'>('MOBIL');
  const [transmission, setTransmission] = useState<'MANUAL' | 'OTOMATIS'>('OTOMATIS');
  const [fuel, setFuel] = useState<'BENSIN' | 'DIESEL' | 'LISTRIK'>('BENSIN');
  const [capacity, setCapacity] = useState(7);
  const [cc, setCc] = useState(1500);
  const [desc, setDesc] = useState('');
  const [dailyRate, setDailyRate] = useState(500000);
  const [photo, setPhoto] = useState('');
  const [gpsId, setGpsId] = useState('');

  // Submit Baru
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUnit = {
      id: `v-owner-${Math.floor(100 + Math.random() * 900)}`,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      ownerAvatar: currentUser.avatarUrl,
      ownerRating: 5.0,
      name: name || `${brand} ${model} ${year}`,
      brand: brand,
      model: model,
      year: year,
      color: color,
      plateNumber: plate,
      type: type,
      transmission: transmission,
      fuel: fuel,
      passengerCapacity: capacity,
      cc: cc,
      description: desc || 'Unit armada mulus, selalu dicuci sebelum disewakan kepada penyewa aktif.',
      dailyRate: dailyRate,
      weeklyDiscount: 10,
      monthlyDiscount: 20,
      hasDriverOption: type === 'MOBIL',
      driverRate: 150000,
      rating: 5.0,
      reviewCount: 0,
      status: 'AVAILABLE' as const,
      isFeatured: false,
      photos: [photo || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'],
      features: ['GPS Tracker Aktif', 'Kamera Dashcam Depan', 'Bluetooth Player'],
      rules: ['Tidak boleh merokok di dalam mobil', 'Kembalikan dalam kondisi bahan bakar sesuai serah terima'],
      location: 'Jakarta Barat',
      gpsDeviceId: gpsId || `GPS-OWNER-${Math.floor(1000 + Math.random() * 9000)}`
    };
    onAddVehicle(newUnit);
    setShowAddForm(false);
    // Reset
    setName('');
    setModel('');
    setPlate('');
    setDesc('');
    setPhoto('');
    setGpsId('');
    alert('Sukses menambah armada unit sewa baru! GPS Tracker dalam status Online.');
  };

  // Hitung Omset simulasi secara real-time / live-time & lifetime
  const [revenuePeriod, setRevenuePeriod] = useState<'MONTHLY' | 'LIFETIME'>('MONTHLY');

  const approvedBookings = bookings.filter(b => b.status === 'DISETUJUI' || b.status === 'AKTIF' || b.status === 'SELESAI');
  const dynamicRevenue = approvedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const activeRentersCount = bookings.filter(b => b.status === 'AKTIF').length;

  const pendingRequests = bookings.filter(b => b.status === 'DISETUJUI');
  const potentialBookingRevenue = pendingRequests.reduce((sum, b) => sum + b.totalPrice, 0);

  const incomeStats = {
    monthlyRevenue: 13550000 + dynamicRevenue,
    lifetimeRevenue: 75890000 + dynamicRevenue,
    activeRenters: activeRentersCount,
    totalUnits: vehicles.length,
    occupancyRate: vehicles.length > 0 ? Math.min(100, Math.round((activeRentersCount / vehicles.length) * 100) + 55) : 75 // %
  };

  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-10 pb-24 text-left">
      
      {/* STATISTIK RINGKASAN PENDAPATAN HOST */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border rounded-3xl p-6 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block">
                {revenuePeriod === 'LIFETIME' ? 'OMSET LIFETIME' : 'OMSET BULAN INI'}
              </span>
              <strong className="text-xl sm:text-2xl font-black text-slate-900 font-display block">
                Rp {(revenuePeriod === 'LIFETIME' ? incomeStats.lifetimeRevenue : incomeStats.monthlyRevenue).toLocaleString('id-ID')}
              </strong>
              {potentialBookingRevenue > 0 && (
                <span className="text-[9.5px] text-amber-700 bg-amber-50 border border-amber-200/60 rounded-xl px-2 py-1 mt-1 font-bold block animate-pulse">
                  ⏳ +Rp {potentialBookingRevenue.toLocaleString('id-ID')} Menunggu Persetujuan ({pendingRequests.length} sewa baru)
                </span>
              )}
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                {revenuePeriod === 'LIFETIME' ? '● Akuntansi Kumulatif' : '▲ 15.4% Dari Bulan Lalu'}
              </span>
            </div>
          </div>
          
          {/* Toggle buttons */}
          <div className="flex flex-col gap-1 bg-slate-50 border border-slate-100 rounded-xl p-1 shrink-0">
            <button 
              type="button" 
              onClick={() => setRevenuePeriod('MONTHLY')} 
              className={`text-[8px] font-extrabold px-1.5 py-1 rounded-lg uppercase leading-none transition-all ${revenuePeriod === 'MONTHLY' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
            >
              Bulan Ini
            </button>
            <button 
              type="button" 
              onClick={() => setRevenuePeriod('LIFETIME')} 
              className={`text-[8px] font-extrabold px-1.5 py-1 rounded-lg uppercase leading-none transition-all ${revenuePeriod === 'LIFETIME' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
            >
              Lifetime
            </button>
          </div>
        </div>

        <div className="bg-white border rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 text-blue-700 p-4 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block">RIDER AKTIF BERJALAN</span>
            <strong className="text-xl sm:text-2xl font-black text-slate-900 font-display">{incomeStats.activeRenters} Penyewa</strong>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Sewa terpantau GPS Aktif</span>
          </div>
        </div>

        <div className="bg-white border rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block">TOTAL ARMADA ANDA</span>
            <strong className="text-xl sm:text-2xl font-black text-slate-900 font-display">{incomeStats.totalUnits} Unit</strong>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Mobil & Motor Terverifikasi</span>
          </div>
        </div>

        <div className="bg-white border rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-slate-50 text-slate-700 p-4 rounded-2xl">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block">TINGKAT OKUPANSI</span>
            <strong className="text-xl sm:text-2xl font-black text-slate-900 font-display">{incomeStats.occupancyRate}%</strong>
            <span className="text-[10px] text-slate-500 font-bold block mt-0.5">Unit jarang menganggur</span>
          </div>
        </div>
      </section>

      {/* TWO COLUMNS: ACTIONABLE LISTING VS INCOMING CONTRACTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM ASAS: KELOLA ARMADA / TAMBAH ARMADA (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="font-extrabold text-slate-900 text-xl tracking-tight">Katalog Armada Milik Anda</h2>
              <p className="text-xs text-slate-500">Mendaftarkan unit mobil / motor baru lengkap pelacak modul GPS anti-maling.</p>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-emerald-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-emerald-500 transition-all flex items-center gap-1.5 shadow-sm font-display shadow-emerald-600/10"
            >
              <Plus className="w-4 h-4" /> Daftar Unit Baru
            </button>
          </div>

          {/* ADD VEHICLE DIGITAL FORM */}
          {showAddForm && (
            <form onSubmit={handleAddSubmit} className="bg-white border border-slate-200 p-6 rounded-3xl space-y-6 shadow-inner animate-in fade-in slide-in-from-top-3">
              <div className="text-left border-b border-slate-50 pb-4">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                  <Car className="w-5 h-5 text-emerald-600" /> Formulir Registrasi Kendaraan Rental Baru
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Isi data spesifikasi orisinal STNK/KTP unit kendaraan Anda.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                {/* Brand */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Merek Kendaraan</label>
                  <select 
                    value={brand} 
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Toyota">Toyota (Mobil)</option>
                    <option value="Honda">Honda (Mobil & Motor)</option>
                    <option value="Mitsubishi">Mitsubishi (Mobil)</option>
                    <option value="Suzuki">Suzuki (Mobil & Motor)</option>
                    <option value="Kawasaki">Kawasaki (Motor)</option>
                    <option value="Vespa">Vespa Piaggio (Motor)</option>
                  </select>
                </div>

                {/* Model */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model/Seri Unit</label>
                  <input 
                    type="text" 
                    value={model} 
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400" 
                    placeholder="Contoh: Innova Zenix / Primavera S"
                    required
                  />
                </div>

                {/* Tipe Kendaraan */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jenis Unit</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['MOBIL', 'MOTOR'].map((tp) => (
                      <button
                        type="button"
                        key={tp}
                        onClick={() => setType(tp as any)}
                        className={`py-2 text-xs font-bold border rounded-lg transition-all ${
                          type === tp
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        {tp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CC Kendaraan */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kapasitas Mesin (CC)</label>
                  <input 
                    type="number" 
                    value={cc} 
                    onChange={(e) => setCc(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" 
                    required
                  />
                </div>

                {/* Transmisi */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transmisi</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="MANUAL">MANUAL (Gigi Kopling)</option>
                    <option value="OTOMATIS">OTOMATIS (Akselerasi Matic)</option>
                  </select>
                </div>

                {/* Bahan Bakar */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bahan Bakar</label>
                  <select
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="BENSIN">BENSIN / PERTALITE / PERTAMAX</option>
                    <option value="DIESEL">SOLAR / DEX / DEXLITE</option>
                    <option value="LISTRIK">EV LISTRIK BATTERY</option>
                  </select>
                </div>

                {/* Plat Nomor */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plat Nomor Kendaraan (STNK Asli)</label>
                  <input 
                    type="text" 
                    value={plate} 
                    onChange={(e) => setPlate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    placeholder="Contoh: B 1245 ZNX"
                    required
                  />
                </div>

                {/* Tarif Harian */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tarif Sewa Harian (IDR)</label>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                      <span>Rentang:</span>
                      <strong>Rp {(dailyRate || 0).toLocaleString('id-ID')}</strong>
                    </span>
                  </div>
                  <input 
                    type="number" 
                    value={dailyRate} 
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    placeholder="Contoh: 500000"
                    required
                  />
                  <span className="text-[9px] text-slate-405 font-medium block">
                    Masukan angka mentah tanpa titik (Sistem memformat otomatis ke Rupiah di atas).
                  </span>
                </div>

                {/* GPS Tracker Device ID */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GPS Device ID (Wajib Pelacak Anti-Maling)</label>
                  <input 
                    type="text" 
                    value={gpsId} 
                    onChange={(e) => setGpsId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs placeholder-slate-400 font-mono"
                    placeholder="Contoh: GPS-ZNX-9981"
                    required
                  />
                </div>

                {/* Link & Unggah Foto */}
                <div className="space-y-2 col-span-2 border-t border-slate-100 pt-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Foto Utama Unit Kendaraan</label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Opsi A: File Upload */}
                    <div className="space-y-1.5 text-left">
                      <span className="text-[10px] font-bold text-slate-500 block">Opsi A: Unggah File Foto (Disarankan)</span>
                      <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setPhoto(event.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/20 active:bg-emerald-50/40 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[110px] relative"
                        onClick={() => document.getElementById('file-upload-input')?.click()}
                      >
                        <input 
                          id="file-upload-input"
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setPhoto(event.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <Camera className="w-6 h-6 text-emerald-600 mb-1" />
                        <span className="text-[10.5px] font-bold text-slate-700 block">Klik / Seret file foto ke sini</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Mendukung file PNG, JPG, JPEG</span>
                      </div>
                    </div>

                    {/* Opsi B: Direct Image URL input */}
                    <div className="space-y-3 flex flex-col justify-between">
                      <div className="space-y-1.5 text-left">
                        <span className="text-[10px] font-bold text-slate-500 block">Opsi B: Atau Tempel URL Foto Web</span>
                        <input 
                          type="text" 
                          value={photo} 
                          onChange={(e) => setPhoto(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs placeholder-slate-400"
                          placeholder="https://images.unsplash.com/photo-..."
                        />
                      </div>

                      {/* Live Image Preview */}
                      {photo && (
                        <div className="bg-emerald-50/30 border border-dashed border-emerald-200 rounded-2xl p-2 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-150">
                          <img 
                            src={photo} 
                            alt="Pratinjau Unit" 
                            className="w-16 h-12 object-cover rounded-lg border shadow-sm shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800';
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest block">Pratinjau Berhasil</span>
                            <span className="text-[9px] text-slate-400 truncate block mt-0.5">{photo.startsWith('data:') ? 'Unggahan Foto Lokal' : photo}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPhoto('')}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-400 hover:text-slate-900 border border-slate-200 px-4 py-2 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 text-white font-extrabold text-xs px-6 py-2 rounded-xl hover:bg-emerald-500 transition-all font-display shadow-md shadow-emerald-600/10"
                >
                  Daftarkan Armada
                </button>
              </div>
            </form>
          )}

          {/* LIST UNIT AKTIF */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((v) => {
              const activeBooking = bookings.find(b => b.vehicleId === v.id && b.status === 'AKTIF');
              return (
                <div key={v.id} className="bg-white border rounded-2xl p-4 flex gap-4 items-center justify-between relative hover:shadow-md transition-all">
                  <div className="flex gap-4 items-center flex-1 min-w-0">
                    <img src={v.photos[0]} alt="" className="w-20 h-16 rounded-xl object-cover shrink-0" />
                    <div className="text-left space-y-1 min-w-0 flex-1">
                      {activeBooking ? (
                        <div className="space-y-1">
                          <span className="text-[9px] font-extrabold bg-rose-50 text-rose-700 border border-rose-100 px-1.5 py-0.5 rounded uppercase tracking-wider block w-max">
                            🔴 SEDANG TERPAKAI / TIDAK AVAILABLE
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight line-clamp-1">{v.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono tracking-wide">Plat: {v.plateNumber} • GPS: {v.gpsDeviceId}</p>
                          <p className="text-[10px] font-bold text-rose-600 bg-rose-50/40 px-2 py-1 rounded-lg border border-dashed border-rose-100/70 inline-block">
                            📅 Sewa: {formatDateIndo(activeBooking.startDate)} s/d {formatDateIndo(activeBooking.endDate)} oleh {activeBooking.renterName}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold uppercase tracking-wide border px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border-emerald-100">
                            🟢 AVAILABLE
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight line-clamp-1">{v.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono tracking-wide">Plat: {v.plateNumber} • GPS: {v.gpsDeviceId}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      if (confirm(`Apakah Anda yakin ingin menghapus unit sewa "${v.name}" ?\nTindakan ini bersifat permanen.`)) {
                        onDeleteVehicle && onDeleteVehicle(v.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl border border-transparent hover:border-rose-100 transition-all shrink-0 ml-2"
                    title="Hapus Unit Kendaraan"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* INCOMING BOOKING REQUESTS (1/3 width) */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="font-extrabold text-slate-900 text-xl tracking-tight">Booking Masuk</h2>
            <p className="text-xs text-slate-500">Persetujuan sewa nirlaba dari calon penyewa ter-KYC.</p>
          </div>

          <div className="space-y-4">
            {bookings.filter(b => b.status === 'DISETUJUI').length === 0 ? (
              <div className="bg-white border border-dashed rounded-3xl p-8 text-center text-slate-400">
                <span className="text-xs font-bold block">Belum ada penyewaan baru.</span>
              </div>
            ) : (
              bookings.filter(b => b.status === 'DISETUJUI').map((booking) => (
                <div key={booking.id} className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 text-left">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] bg-indigo-50 text-indigo-800 px-1.5 py-0.5 rounded font-extrabold uppercase">
                        PENDING APPROVAL
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{booking.renterName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">Menyewa: {booking.vehicleName}</p>
                    </div>
                    <strong className="text-xs text-emerald-600 block">Rp {booking.totalPrice.toLocaleString('id-ID')}</strong>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1 border-t border-slate-50 pt-3">
                    <div className="flex justify-between">
                      <span>Mulai</span>
                      <strong className="text-slate-800">{booking.startDate}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Sampai</span>
                      <strong className="text-slate-800">{booking.endDate}</strong>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => onRejectBooking(booking.id)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1 flex-1"
                    >
                      <X className="w-3.5 h-3.5 text-rose-500" /> Tolak
                    </button>
                    <button
                      onClick={() => onAcceptBooking(booking.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1 flex-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Setujui
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
