import React, { useState } from 'react';
import { Vehicle, User, Voucher } from '../types';
import { 
  Check, 
  ChevronRight, 
  ShieldCheck, 
  PhoneCall, 
  FileText, 
  Sparkles, 
  CreditCard, 
  Camera, 
  MapPin, 
  Clock, 
  Gift, 
  AlertTriangle,
  Info,
  Star
} from 'lucide-react';
import { mockVouchers } from '../data/mockData';

interface BookingWizardProps {
  vehicle: Vehicle;
  currentUser: User;
  onBookingSuccess: (newBooking: any) => void;
  onCancel: () => void;
  bookingOptions: {
    withDriver: boolean;
    startDate: string;
    endDate: string;
    days: number;
    finalTotal: number;
    depositAmount: number;
  };
}

export default function BookingWizard({
  vehicle,
  currentUser,
  onBookingSuccess,
  onCancel,
  bookingOptions
}: BookingWizardProps) {
  const [step, setStep] = useState(1);

  // States per langkah
  // Step 2: Add-ons
  const [selectedAddons, setSelectedAddons] = useState<{ id: string; name: string; price: number; selected: boolean }[]>([
    { id: 'home_delivery', name: 'Layanan Antar-Jemput Armada ke Rumah (Home Delivery)', price: 45000, selected: false },
    { id: 'baby_seat', name: 'Premium Baby Car Seat (Kursi Bayi)', price: 35000, selected: false },
    { id: 'damage_waiver', name: 'Waiver Kerusakan Minor (Denda Rp 0)', price: 15000, selected: false }
  ]);

  // Step 3: KYC Gate
  const [ktpNo, setKtpNo] = useState('3273051201950002');
  const [simNo, setSimNo] = useState('951214088910');
  const [simType, setSimType] = useState('SIM_A');
  const [kycUploaderState, setKycUploaderState] = useState({
    ktpUpload: true,
    simUpload: true,
    selfieUpload: true
  });

  // Step 4: Kontak Darurat
  const [emergencyName, setEmergencyName] = useState('Siti Rahma');
  const [emergencyPhone, setEmergencyPhone] = useState('081299887711');
  const [emergencyRelation, setEmergencyRelation] = useState('Istri');

  // Step 5: Tanda Tangan Perjanjian Digital
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [signatureText, setSignatureText] = useState('Budi Prasetyo');
  const [drawnSignature, setDrawnSignature] = useState(false);

  // Step 6: Voucher Promo
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState('');

  // Step 7: Pembayaran Midtrans Mock
  const [paymentMethod, setPaymentMethod] = useState('GOPAY');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const days = bookingOptions.days;

  const handleToggleAddon = (index: number) => {
    const nextAddons = [...selectedAddons];
    nextAddons[index].selected = !nextAddons[index].selected;
    setSelectedAddons(nextAddons);
  };

  const isDriverSelected = bookingOptions.withDriver;
  const driverCost = isDriverSelected ? (vehicle.driverRate || 150000) * days : 0;

  const activeAddonsCost = selectedAddons
    .filter(a => a.selected)
    .reduce((sum, current) => {
      if (current.id === 'home_delivery') {
        return sum + current.price; // Flat sekali sewa
      }
      return sum + (current.price * days);
    }, 0);

  // Hitung ulang harga
  const baseCost = vehicle.dailyRate * days;
  
  let rentDiscount = 0;
  if (days >= 30) rentDiscount = (baseCost * vehicle.monthlyDiscount) / 100;
  else if (days >= 7) rentDiscount = (baseCost * vehicle.weeklyDiscount) / 100;

  // hitung voucher diskon
  let voucherDiscount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discountValue) {
      voucherDiscount = appliedVoucher.discountValue;
    } else if (appliedVoucher.discountPercentage) {
      voucherDiscount = (baseCost * appliedVoucher.discountPercentage) / 100;
    }
  }

  const platformFee = 50000;
  const depositAmount = bookingOptions.depositAmount;
  const subtotalBeforeVoucher = baseCost + driverCost + activeAddonsCost + platformFee - rentDiscount;
  const finalTotalAmount = Math.max(100000, subtotalBeforeVoucher - voucherDiscount);

  // Handle Voucher Apply
  const applyVoucher = () => {
    setVoucherError('');
    const found = mockVouchers.find(v => v.code.toUpperCase() === voucherCode.toUpperCase());
    if (found) {
      if (subtotalBeforeVoucher >= found.minBookingValue) {
        setAppliedVoucher(found);
      } else {
        setVoucherError(`Voucher hanya berlaku untuk minimal sewa Rp ${found.minBookingValue.toLocaleString('id-ID')}`);
        setAppliedVoucher(null);
      }
    } else {
      setVoucherError('Kode voucher tidak valid / kedaluwarsa.');
      setAppliedVoucher(null);
    }
  };

  // Kirim Pembayaran
  const handlePaymentSubmit = () => {
    setIsProcessingPayment(true);
    // Simulasi respons API Midtrans
    setTimeout(() => {
      setIsProcessingPayment(false);
      const newBooking = {
        id: `B-RE-${Math.floor(100000 + Math.random() * 900000)}`,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        vehiclePhoto: vehicle.photos[0],
        renterId: currentUser.id,
        renterName: currentUser.name,
        ownerId: vehicle.ownerId,
        startDate: bookingOptions.startDate,
        endDate: bookingOptions.endDate,
        deliveryMethod: 'PICKUP' as const,
        deliveryFee: 0,
        basePrice: baseCost,
        addonPrice: activeAddonsCost + driverCost,
        depositAmount: depositAmount,
        totalPrice: finalTotalAmount,
        status: 'DISETUJUI' as const,
        qrCodeHandover: `QR_${vehicle.id}_START_VERIFIED_AUTH`,
        emergencyContacts: [
          { name: emergencyName, phone: emergencyPhone, relationship: emergencyRelation }
        ],
        paymentMethod: paymentMethod,
        paymentStatus: 'SUCCESS' as const,
        depositStatus: 'HOLD' as const,
        rentalAgreementSigned: true
      };
      onBookingSuccess(newBooking);
      setStep(8);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 text-left">
      
      {/* HEADER WIZARD BAR */}
      <div className="flex justify-between items-center bg-white border border-slate-100 p-4 rounded-2xl shadow-sm mb-8">
        <div>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">ALUR CHECOUT</span>
          <h2 className="font-extrabold text-slate-900 text-base md:text-lg">Checkout Langkah {step} dari 8</h2>
        </div>
        <button 
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-900 font-bold border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all"
        >
          Batalkan Sewa
        </button>
      </div>

      {/* HORIZONTAL TIMELINE STEPS INDICATOR */}
      <div className="hidden sm:flex justify-between items-center mb-8 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                step === s 
                  ? 'bg-emerald-600 border-emerald-600 text-white font-black shadow-lg shadow-emerald-600/25 ring-4 ring-emerald-50' 
                  : step > s 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                    : 'bg-white border-slate-200 text-slate-400'
              }`}>
                {step > s ? <Check className="w-4.5 h-4.5" /> : s}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                step === s ? 'text-emerald-700' : 'text-slate-400'
              }`}>
                {s === 1 && 'Durasi'}
                {s === 2 && 'Opsional'}
                {s === 3 && 'KYC'}
                {s === 4 && 'Darurat'}
                {s === 5 && 'Akad'}
                {s === 6 && 'Voucher'}
                {s === 7 && 'Midtrans'}
                {s === 8 && 'Selesai'}
              </span>
            </div>
            {s < 8 && <ChevronRight className="w-4 h-4 text-slate-200" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* VIEW KONTEN UTAMA STEP */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* STEP 1: REVIEW DURASI TANGGAL */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">Konfirmasi Durasi Sewa</h3>
                <p className="text-xs text-slate-500">Silakan pastikan kembali tanggal aktivitas rental Anda dengan cermat.</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 text-xs text-emerald-950 font-semibold leading-relaxed">
                <Info className="w-4.5 h-4.5 text-emerald-700 mt-0.5 flex-shrink-0" />
                <span>Kendaraan {vehicle.name} Anda disewa selama <strong className="text-emerald-800">{days} Hari</strong> dari tanggal {bookingOptions.startDate} s/d {bookingOptions.endDate}.</span>
              </div>

              <div className="border border-slate-100 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between text-xs py-1.5 border-b border-slate-50 font-medium text-slate-600">
                  <span>Nama Armada</span>
                  <strong className="text-slate-900">{vehicle.name}</strong>
                </div>
                <div className="flex justify-between text-xs py-1.5 border-b border-slate-50 font-medium text-slate-600">
                  <span>Wilayah Operasional</span>
                  <strong className="text-slate-900">{vehicle.location}</strong>
                </div>
                {isDriverSelected && (
                  <div className="flex justify-between text-xs py-1.5 font-medium text-slate-600 text-emerald-700">
                    <span>Layanan Pengemudi/Driver</span>
                    <strong className="font-extrabold">Aktif (Rp {vehicle.driverRate.toLocaleString('id-ID')}/hari)</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: PILIHAN ADD-ON PELENGKAP */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">Layanan Tambahan (Add-on)</h3>
                <p className="text-xs text-slate-500">Lengkapi kebutuhan perjalanan sewa Anda agar lebih nyaman & tanpa repot.</p>
              </div>

              {/* FITUR KEAMANAN WAJIB & GRATIS - GPS TRACKER */}
              <div className="bg-emerald-50/80 border-2 border-emerald-500/20 rounded-2xl p-4 flex gap-3.5 shadow-sm text-left items-start">
                <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-700 shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">Fitur Wajib Standar Keamanan: GPS Tracker Super Akurat</h4>
                    <span className="bg-emerald-500 text-white font-extrabold text-[8px] px-2 py-0.5 rounded-full leading-none uppercase tracking-wider">Aktif Otomatis & Gratis</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    Modul GPS Tracker Real-time Super Akurat terpasang & aktif 24/7 di semua unit armada RentaKu tanpa dikenakan tarif sewa (Rp 0). Demi keamanan penuh penyewa dan pemilik kendaraan, fitur pelacakan ini wajib aktif di setiap transaksi.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Opsi Layanan Tambahan Sukarela</span>
                {selectedAddons.map((addon, index) => (
                  <div 
                    key={addon.id} 
                    onClick={() => handleToggleAddon(index)}
                    className={`flex items-center justify-between border rounded-2xl p-4 cursor-pointer transition-all ${
                      addon.selected 
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' 
                        : 'border-slate-150 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-left space-y-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">{addon.name}</h4>
                      <p className="text-[11px] text-slate-400 font-semibold">
                        {addon.id === 'home_delivery'
                          ? `Tarif: Rp ${addon.price.toLocaleString('id-ID')} (Flat Sekali Transaksi)`
                          : `Tarif: Rp ${addon.price.toLocaleString('id-ID')} /hari x ${days} Hari`
                        }
                      </p>
                    </div>
                    <div className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center ${
                      addon.selected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {addon.selected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: KYC GATE VALIDATION */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl flex items-center gap-1.5">
                  <ShieldCheck className="text-emerald-600 w-5 h-5" /> Verifikasi Identitas KYC
                </h3>
                <p className="text-xs text-slate-500">Melindungi penyewa dari sengketa & kepatuhan penuh perbankan.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 font-medium text-slate-700 text-xs">
                
                {/* Input NIK KTP */}
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No NIK KTP</label>
                  <input 
                    type="text" 
                    value={ktpNo} 
                    onChange={(e) => setKtpNo(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* SIM No */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No Surat Izin Mengemudi (SIM)</label>
                    <input 
                      type="text" 
                      value={simNo} 
                      onChange={(e) => setSimNo(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none" 
                    />
                  </div>

                  {/* Jenis SIM */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Golongan SIM</label>
                    <select
                      value={simType}
                      onChange={(e) => setSimType(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                    >
                      <option value="SIM_A">SIM A (Mobil Pribadi)</option>
                      <option value="SIM_B1">SIM B1 (Bus/Truck Ringan)</option>
                      <option value="SIM_C">SIM C (Motor)</option>
                    </select>
                  </div>
                </div>

                {/* Potret unggahan digital */}
                <div className="grid grid-cols-3 gap-3 pt-4">
                  {/* KTP */}
                  <div className="bg-white border rounded-xl p-3 text-center space-y-2 border-emerald-500 shadow-inner">
                    <Camera className="w-5 h-5 mx-auto text-emerald-600" />
                    <span className="text-[10px] font-bold text-slate-800 block leading-tight">Foto KTP Depan</span>
                    <span className="text-[8px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded">TERUNGGAH</span>
                  </div>
                  {/* SIM */}
                  <div className="bg-white border rounded-xl p-3 text-center space-y-2 border-emerald-500 shadow-inner">
                    <Camera className="w-5 h-5 mx-auto text-emerald-600" />
                    <span className="text-[10px] font-bold text-slate-800 block leading-tight">Foto SIM Depan</span>
                    <span className="text-[8px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded">TERUNGGAH</span>
                  </div>
                  {/* Selfie */}
                  <div className="bg-white border rounded-xl p-3 text-center space-y-2 border-emerald-500 shadow-inner">
                    <Camera className="w-5 h-5 mx-auto text-emerald-600" />
                    <span className="text-[10px] font-bold text-slate-800 block leading-tight">Swafoto Selfie KTP</span>
                    <span className="text-[8px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded">TERUNGGAH</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: KONTAK DARURAT */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl flex items-center gap-1.5">
                  <PhoneCall className="text-emerald-600 w-5 h-5" /> Hubungan Kontak Darurat
                </h3>
                <p className="text-xs text-slate-500">Digunakan mendesak apabila penyewa mengalami problem darurat di jalan.</p>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Nama Hubungan Kerabat</label>
                  <input 
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-bold focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Nomor HP / WhatsApp Aktif</label>
                    <input 
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-bold focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Hubungan Keluarga</label>
                    <select
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-bold focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Istri">Istri</option>
                      <option value="Suami">Suami</option>
                      <option value="Orang Tua">Orang Tua</option>
                      <option value="Anak">Anak</option>
                      <option value="Kakak/Adik">Kakak/Adik</option>
                      <option value="Teman Dekat">Teman Dekat</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: AKAD PERJANJIAN SEWA DIGITAL */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl flex items-center gap-1.5">
                  <FileText className="text-emerald-600 w-5 h-5" /> Surat Perjanjian Rental Digital
                </h3>
                <p className="text-xs text-slate-500">Tanda tangan akad sewa secara legal berkekuatan hukum tetap.</p>
              </div>

              {/* Teks Perjanjian Hukum */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 h-48 overflow-y-auto text-[11px] text-slate-500 leading-relaxed font-medium custom-scrollbar">
                <p className="font-bold text-slate-800 text-center uppercase mb-3">SURAT AKAD DAN PERNYATAAN SEWA RENTAKU PRO</p>
                <p className="mb-2">Saya yang bertanda tangan di bawah ini secara sadar menyatakan bersedia untuk mematuhi regulasi sewa:</p>
                <ul className="list-decimal list-inside space-y-1 mb-3 text-left">
                  <li>Menjaga serta bertanggung jawab penuh atas bodi & perlengkapan unit selama sewa.</li>
                  <li>Wajib melakukan check-in selfie harian guna validasi anti-penggelapan unit.</li>
                  <li>Uang deposit nominal 30% akan ditahan otomatis di dompet RentaKu selama sewa, & dilepaskan utuh dalam 24 jam setelah pengembalian unit tervalidasi mulus oleh admin/owner.</li>
                  <li>Jika kedapatan berkendara melewati batas wilayah kesepakatan tanpa izin tertulis, GPS berhak dinonaktifkan secara engine remote dan didenda Rp 1.500.000.</li>
                </ul>
                <p>Demikian surat pernyataan kerja sama rental digital ini dibentuk demi rukun kemashlahatan sewa.</p>
              </div>

              {/* Tanda tangan digital bar */}
              <div className="space-y-4">
                <div className="bg-white border rounded-2xl p-5 text-center border-slate-200 relative">
                  <div className="absolute right-4 top-4 bg-emerald-100 text-[9px] text-emerald-800 font-extrabold px-1.5 py-0.5 rounded uppercase">E-SIGN READY</div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-left">Goreskan Goresan Tangan / Masukkan Nama Lengkap Akad</span>
                  
                  <input 
                    type="text" 
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    className="w-full max-w-sm mx-auto text-center border-b-2 border-emerald-600 py-3 font-mono font-bold text-lg text-slate-800 focus:outline-none"
                    placeholder="Contoh: Budi Prasetyo"
                  />
                  <span className="text-[10px] text-slate-400 block mt-2 text-center">Tulis nama lengkap Anda sebagai pengganti tanda tangan basah digital.</span>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4.5 h-4.5 text-emerald-600 focus:ring-emerald-500 rounded cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-600">Saya membaca, memahami, & bersedia patuh seutuhnya atas klausul hukum di atas.</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: KUPON VOUCHER */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl flex items-center gap-1.5">
                  <Gift className="text-emerald-600 w-5.5 h-5.5" /> Gunakan Voucher Hemat
                </h3>
                <p className="text-xs text-slate-500">Makin hemat sewa dengan potongan voucher resmi platform RentaKu.</p>
              </div>

              <div className="flex gap-2 text-left">
                <input 
                  type="text" 
                  value={voucherCode}
                  onChange={(e) => {
                    setVoucherCode(e.target.value);
                    setVoucherError('');
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-extrabold focus:outline-none flex-1 font-mono uppercase"
                  placeholder="Contoh: RENTAKUSTART"
                />
                <button 
                  onClick={applyVoucher}
                  className="bg-emerald-600 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl hover:bg-emerald-500 transition-all"
                >
                  Gunakan
                </button>
              </div>

              {voucherError && (
                <p className="text-xs text-rose-600 font-semibold">{voucherError}</p>
              )}

              {appliedVoucher && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-950 text-xs font-semibold leading-relaxed flex justify-between items-center">
                  <div>
                    <span className="bg-emerald-100 text-[9px] text-emerald-800 px-1.5 py-0.5 rounded font-extrabold tracking-wider uppercase">SUKSES TERAPKAN VOUCHER</span>
                    <h4 className="font-bold text-slate-800 mt-1">{appliedVoucher.code}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{appliedVoucher.description}</p>
                  </div>
                  <strong className="text-base text-emerald-700">-Rp {voucherDiscount.toLocaleString('id-ID')}</strong>
                </div>
              )}
            </div>
          )}

          {/* STEP 7: MIDTRANS MOCK PAYMENT */}
          {step === 7 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl flex items-center gap-1.5">
                  <CreditCard className="text-emerald-600 w-5 h-5 animate-pulse" /> Gerbang Pembayaran Midtrans (Enskripsi Aman)
                </h3>
                <p className="text-xs text-slate-500">Pilih channel transfer digital Midtrans yang paling instan untuk Anda.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {/* VA BCA */}
                <div 
                  onClick={() => setPaymentMethod('BCA_VA')}
                  className={`border rounded-2xl p-4 cursor-pointer flex justify-between items-center transition-all ${
                    paymentMethod === 'BCA_VA' ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-150 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold text-slate-800 block">BCA Virtual Account</span>
                    <span className="text-[10px] text-slate-400 font-bold">Verifikasi Berjalan Otomatis</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    paymentMethod === 'BCA_VA' ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                  }`} />
                </div>

                {/* Mandiri VA */}
                <div 
                  onClick={() => setPaymentMethod('MANDIRI_VA')}
                  className={`border rounded-2xl p-4 cursor-pointer flex justify-between items-center transition-all ${
                    paymentMethod === 'MANDIRI_VA' ? 'border-amber-600 bg-amber-50/20' : 'border-slate-150 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold text-slate-800 block">Mandiri Bill Payment</span>
                    <span className="text-[10px] text-slate-400 font-bold">Verifikasi Pembayaran 24/7</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    paymentMethod === 'MANDIRI_VA' ? 'bg-amber-600 border-amber-600' : 'border-slate-300'
                  }`} />
                </div>

                {/* QRIS */}
                <div 
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`border rounded-2xl p-4 cursor-pointer flex justify-between items-center transition-all ${
                    paymentMethod === 'QRIS' ? 'border-teal-600 bg-teal-50/20' : 'border-slate-150 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold text-slate-800 block">QRIS Mandiri / OVO / Dana / LinkAja</span>
                    <span className="text-[10px] text-slate-400 font-bold">Scan Langsung di Layar</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    paymentMethod === 'QRIS' ? 'bg-teal-600 border-teal-600' : 'border-slate-300'
                  }`} />
                </div>

                {/* GoPay */}
                <div 
                  onClick={() => setPaymentMethod('GOPAY')}
                  className={`border rounded-2xl p-4 cursor-pointer flex justify-between items-center transition-all ${
                    paymentMethod === 'GOPAY' ? 'border-cyan-600 bg-cyan-50/20' : 'border-slate-150 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold text-slate-800 block">GoPay Indonesia</span>
                    <span className="text-[10px] text-slate-400 font-bold">Buka Otomatis Aplikasi Gojek</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    paymentMethod === 'GOPAY' ? 'bg-cyan-600 border-cyan-600' : 'border-slate-300'
                  }`} />
                </div>
              </div>

              {isProcessingPayment && (
                <div className="bg-slate-900/10 rounded-2xl p-5 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full"></div>
                  <span className="text-xs font-extrabold text-slate-800">Menghubungkan Midtrans API... Mohon tunggu jangan menutup halaman.</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 8: RINGKASAN TRANSAKSI SUKSES */}
          {step === 8 && (
            <div className="space-y-6 text-center py-8">
              <div className="bg-emerald-100 text-emerald-700 w-16 h-16 rounded-full mx-auto flex items-center justify-center animate-bounce shadow-md">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">PEMESANAN SUKSES!</span>
                <h3 className="font-extrabold text-slate-950 text-2xl tracking-tight">Sewa Kendaraan Berhasil Tervalidasi</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Pembayaran lunas terverifikasi instan, deposit jaminan Anda aman tertahan, silakan menuju halaman Dashboard Penyewa untuk melihat detail serah terima.
                </p>
              </div>

              {/* Barcode QR Code Serah Terima */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-xs mx-auto text-center space-y-3">
                <div className="bg-white border rounded-xl p-4 flex items-center justify-center relative shadow-inner">
                  {/* Mock beautiful QR */}
                  <div className="w-36 h-36 border-4 border-slate-800 rounded-lg flex flex-col items-center justify-center p-3">
                    <div className="grid grid-cols-4 gap-2 w-full h-full opacity-80 bg-[radial-gradient(#000_30%,transparent_31%)] bg-[size:10px_10px]">
                      {/* Fake code block lines visual */}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">QR CODE HANDOVER</span>
                  <span className="text-xs font-mono font-bold text-slate-800 select-all">QR_{vehicle.id}_START_VERIFIED_AUTH</span>
                  <span className="text-[9px] text-slate-400 block leading-tight font-medium">Bawa HP ini & tunjukkan QR ini pada Pemilik kendaraan saat pengambilan armada sewa.</span>
                </div>
              </div>
            </div>
          )}

          {/* PREV/NEXT NAVIGATION BUTTONS */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-50">
            {step > 1 && step < 8 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="text-xs text-slate-500 hover:text-slate-900 border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 font-bold"
              >
                Kembali
              </button>
            )}
            <div className="ml-auto flex gap-2">
              {step < 7 && (
                <button 
                  onClick={() => {
                    if (step === 5 && !acceptedTerms) {
                      alert('Anda harus menyetujui surat akad dan melengkapi nama tanda tangan sebelum berlanjut.');
                      return;
                    }
                    setStep(step + 1);
                  }}
                  className="bg-emerald-600 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl hover:bg-emerald-500 transition-all flex items-center gap-1"
                >
                  Langkah Seterusnya <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {step === 7 && (
                <button 
                  onClick={handlePaymentSubmit}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-8 py-3 rounded-xl transition-all shadow-md shadow-emerald-600/10"
                >
                  Bayar & Selesaikan Sewa
                </button>
              )}
              {step === 8 && (
                <button 
                  onClick={onCancel}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-8 py-3 rounded-xl transition-all shadow-md"
                >
                  Mantap, Masuk Ke Home
                </button>
              )}
            </div>
          </div>

        </div>

        {/* VIEW DETIL RINGKASAN HARGA DI KANAN */}
        <div className="w-full lg:col-span-1">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 text-white space-y-6 sticky top-24">
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block bg-white/10 px-2.5 py-1 rounded w-max leading-none">Armada Sewa</span>
            
            <div className="flex gap-3">
              <img 
                src={vehicle.photos[0]} 
                alt="" 
                className="w-16 h-12 rounded-lg object-cover"
              />
              <div className="text-left space-y-1">
                <span className="text-[10px] text-slate-400 block">{vehicle.transmission} • {vehicle.fuel}</span>
                <h4 className="font-bold text-sm line-clamp-1">{vehicle.name}</h4>
                <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {vehicle.rating.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-5 space-y-3.5 text-xs font-semibold text-slate-300">
              <div className="flex justify-between">
                <span>Harian ({days} Hari)</span>
                <span>Rp {baseCost.toLocaleString('id-ID')}</span>
              </div>
              {isDriverSelected && (
                <div className="flex justify-between">
                  <span>Layanan Sopir</span>
                  <span>Rp {driverCost.toLocaleString('id-ID')}</span>
                </div>
              )}
              {activeAddonsCost > 0 && (
                <div className="flex justify-between">
                  <span>Add-on Fasilitas</span>
                  <span>Rp {activeAddonsCost.toLocaleString('id-ID')}</span>
                </div>
              )}
              {rentDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Diskon Sewa ({days >= 30 ? vehicle.monthlyDiscount : vehicle.weeklyDiscount}%)</span>
                  <span>-Rp {rentDiscount.toLocaleString('id-ID')}</span>
                </div>
              )}
              {appliedVoucher && (
                <div className="flex justify-between text-emerald-400">
                  <span>Voucher ({appliedVoucher.code})</span>
                  <span>-Rp {voucherDiscount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Biaya Platform & Asuransi</span>
                <span>Rp {platformFee.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between border-t border-dashed border-slate-850 pt-3 text-[11px] text-slate-400">
                <span>Keamanan Deposit (30% Jaminan)</span>
                <span>Rp {depositAmount.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between border-t border-slate-800 pt-4 text-base font-extrabold text-white">
                <span>Sisa Bayar Lunas</span>
                <span className="text-emerald-400">Rp {finalTotalAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="bg-slate-850 border border-slate-800 p-3.5 rounded-2xl flex gap-2.5 items-start text-[10px] leading-relaxed text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>
                Setiap pembayaran yang tuntas otomatis diverifikasi sistem. Tanda tangan kontrak digital legal dilindungi undang-undang ITE Indonesia.
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
