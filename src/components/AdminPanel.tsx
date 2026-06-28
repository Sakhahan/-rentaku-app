import React, { useState } from 'react';
import { User, Vehicle, DamageReport, Booking } from '../types';
import { 
  ShieldCheck, 
  UserCheck, 
  AlertOctagon, 
  TrendingUp, 
  Cpu, 
  MapPin, 
  X, 
  Check, 
  Database,
  Lock,
  LifeBuoy
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: User;
  users: User[];
  vehicles: Vehicle[];
  onApproveKyc: (userId: string) => void;
  onRejectKyc: (userId: string, reason: string) => void;
  onApproveVehicle: (vehicleId: string) => void;
  onRejectVehicle: (vehicleId: string) => void;
}

export default function AdminPanel({
  currentUser,
  users,
  vehicles,
  onApproveKyc,
  onRejectKyc,
  onApproveVehicle,
  onRejectVehicle
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'KYC' | 'SENGKETA' | 'MODERASI_VEHICLE'>('KYC');

  // List users pending KYC
  const pendingKycUsers = users.filter(u => u.kycStatus === 'SEDANG_DITINJAU' || u.kycStatus === 'MENUNGGU');

  // List mock dispute deposit
  const [depositDisputes, setDepositDisputes] = useState<DamageReport[]>([
    {
      id: 'DMG-8821',
      bookingId: 'B-RE-10029',
      reportedBy: 'Budi Prasetyo',
      description: 'Goresan cukup panjang pada bemper kanan depan akibat bersenggolan dengan pembatas parkir mall dilarang merokok.',
      photos: ['https://images.unsplash.com/photo-1510931557088-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'],
      estimatedCost: 250000,
      status: 'MENUNGGU_MEDIASI'
    }
  ]);

  const handleResolveDispute = (id: string, action: 'RELEASE' | 'CLAIM_OWNER') => {
    setDepositDisputes(depositDisputes.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: 'TERSELESAIKAN',
          adminNotes: action === 'RELEASE' 
            ? 'Hasil Investigasi: Baret merupakan goresan kecil wajar jalanan. Deposit dicairkan penuh ke penyewa.' 
            : 'Hasil Investigasi: Kerusakan terbukti akibat kelalaian penyewa. Sebagian deposit ditransfer ke owner.'
        };
      }
      return d;
    }));
    alert('Sengketa deposit berhasil dijembatani oleh tim penengah nirlaba RentaKu!');
  };

  return (
    <div className="pb-24 text-left space-y-10">
      
      {/* HEADER UTAMA ADMIN PANEL */}
      <section className="bg-slate-900 rounded-3xl text-white p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="relative space-y-2">
          <span className="text-[10px] bg-emerald-600 px-2.5 py-1 rounded font-extrabold tracking-widest uppercase mb-1">PUSAT KONTROL ADMIN</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">Moderasi & Keamanan RentaKu</h1>
          <p className="text-xs text-slate-400">Persetujuan dokumen validitas KYC, penengah sengketa klaim deposit, dan audit pelacak GPS aktif.</p>
        </div>
      </section>

      {/* HORIZONTAL TAB CONTROL */}
      <div className="flex border-b border-slate-200 gap-1 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('KYC')}
          className={`py-3.5 px-6 border-b-2 transition-all ${
            activeTab === 'KYC'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Verifikasi Dokumen KYC ({pendingKycUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('SENGKETA')}
          className={`py-3.5 px-6 border-b-2 transition-all ${
            activeTab === 'SENGKETA'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Sengketa Deposit & Kerusakan ({depositDisputes.filter(d => d.status === 'MENUNGGU_MEDIASI').length})
        </button>
        <button
          onClick={() => setActiveTab('MODERASI_VEHICLE')}
          className={`py-3.5 px-6 border-b-2 transition-all ${
            activeTab === 'MODERASI_VEHICLE'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Moderasi Armada Kendaraan
        </button>
      </div>

      <div className="space-y-6">
        
        {/* TAB 1: PERSIDANGAN VERIFIKASI KYC MANUAL */}
        {activeTab === 'KYC' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">Antrean Peninjauan Dokumen KYC Pengguna</h2>
              <p className="text-xs text-slate-500">Bandingkan foto wajah selfie dengan dokumen KTP untuk persetujuan lolos transaksi sewa.</p>
            </div>

            {pendingKycUsers.length === 0 ? (
              <div className="bg-white border rounded-3xl p-12 text-center text-slate-400">
                <span className="text-sm font-bold block">Seluruh permohonan KYC tervalidasi tuntas! Mantap.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingKycUsers.map((user) => (
                  <div key={user.id} className="bg-white border border-slate-150 rounded-3xl p-6 space-y-6 shadow-sm">
                    <div className="flex gap-4">
                      <img 
                        src={user.avatarUrl} 
                        alt="" 
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-100"
                      />
                      <div className="text-left space-y-1">
                        <span className="bg-amber-100 text-[9px] text-amber-800 font-extrabold px-1.5 py-0.5 rounded uppercase">
                          SAMPEL IDENTITAS
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-base leading-none">{user.name}</h4>
                        <p className="text-xs text-slate-400 font-semibold">NIK: 327305********81 (Manual OCR)</p>
                      </div>
                    </div>

                    {/* Potret bukti digital pembanding */}
                    <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-700 bg-slate-50 p-4 border rounded-2xl">
                      <div className="text-center space-y-1.5 bg-white border rounded-lg p-2">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Foto KTP</span>
                        <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150" alt="" className="w-full h-20 object-cover rounded-md" />
                      </div>
                      <div className="text-center space-y-1.5 bg-white border rounded-lg p-2">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Swafoto Selfie KTP</span>
                        <img src={user.avatarUrl} alt="" className="w-full h-20 object-cover rounded-md" />
                      </div>
                    </div>

                    {/* Tombol eksekusi */}
                    <div className="flex gap-2 border-t border-slate-50 pt-4">
                      <button
                        onClick={() => onRejectKyc(user.id, 'Foto swafoto goyang kurang jelas')}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl flex-1 flex items-center justify-center gap-1.5"
                      >
                        <X className="w-4 h-4 text-rose-600" /> Tolak KYC
                      </button>
                      <button
                        onClick={() => onApproveKyc(user.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex-1 flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Loloskan KYC
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MEDIASI SENGKETA DISPUTE DEPOSIT */}
        {activeTab === 'SENGKETA' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">Mediasi Sengketa Uang Deposit Jaminan</h2>
              <p className="text-xs text-slate-500">Menjembatani bukti otentik kerusakan baret luar & dalam secara transparan nirlaba.</p>
            </div>

            <div className="space-y-6">
              {depositDisputes.map((dispute) => (
                <div key={dispute.id} className="bg-white border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                    <div className="text-left">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-wide ${
                        dispute.status === 'MENUNGGU_MEDIASI' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {dispute.status}
                      </span>
                      <h4 className="font-extrabold text-slate-950 text-base sm:text-lg mt-1">Sengketa ID: {dispute.id} (Penyewa: {dispute.reportedBy})</h4>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block font-bold">KLAIM TAKSIRAN DATA KILAT</span>
                      <strong className="text-base text-rose-700">Rp {dispute.estimatedCost.toLocaleString('id-ID')} (Ditahan)</strong>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 text-left leading-relaxed">{dispute.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl text-left text-xs font-medium text-slate-500 bg-slate-50 p-4 rounded-2xl">
                    <div>
                      <span className="text-[10.5px] block font-bold text-slate-450 uppercase mb-1">Bukti Potret Kerusakan</span>
                      <img src={dispute.photos[0]} alt="" className="w-full h-32 object-cover rounded-xl border" />
                    </div>
                    <div className="space-y-2 flex flex-col justify-center">
                      <span>Kode Tiket Booking: <strong>{dispute.bookingId}</strong></span>
                      <span>Keputusan Mediasi: <strong>{dispute.adminNotes || 'Sengketa menunggu penelaahan tim legal RentaKu.'}</strong></span>
                    </div>
                  </div>

                  {dispute.status === 'MENUNGGU_MEDIASI' && (
                    <div className="flex gap-2.5 pt-2">
                      <button
                        onClick={() => handleResolveDispute(dispute.id, 'RELEASE')}
                        className="bg-slate-100 hover:bg-slate-205 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border"
                      >
                        Tolak Klaim (Kembalikan Penuh ke Penyewa)
                      </button>
                      <button
                        onClick={() => handleResolveDispute(dispute.id, 'CLAIM_OWNER')}
                        className="bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl ml-auto shadow-sm"
                      >
                        Potong Deposit (Kirim ke Owner untuk Perbaikan)
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MODERASI KELAIKAN JALAN ARMADA */}
        {activeTab === 'MODERASI_VEHICLE' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">Kelola Kelaikan Jalan Armada Kendaraan Baru</h2>
              <p className="text-xs text-slate-500">Mencegah peredaran unit bajakan tanpa plat STNK asli nirlaba jalanan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vehicles.map((v) => (
                <div key={v.id} className="bg-white border rounded-3xl p-5 shadow-sm text-left relative flex gap-4 items-center">
                  <img src={v.photos[0]} alt="" className="w-20 h-16 rounded-xl object-cover" />
                  <div className="space-y-1">
                    <span className="bg-emerald-50 text-[9px] text-emerald-800 border px-1.5 py-0.5 rounded font-extrabold tracking-wide">
                      ARMADA TERMODERASI
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight line-clamp-1">{v.name}</h4>
                    <span className="text-[10px] text-slate-400 block font-mono">GPS ID: {v.gpsDeviceId || 'GPS-ACTIVE-YES'} • Lokasi: {v.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
