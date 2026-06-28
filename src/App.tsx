import React, { useState } from 'react';
import { User, Role, Vehicle, Booking, KYCStatus } from './types';
import { mockUsers, mockVehicles, mockBookings } from './data/mockData';

// Komponen Modular
import Header from './components/Header';
import HomeView from './components/HomeView';
import CatalogsView from './components/CatalogsView';
import DetailView from './components/DetailView';
import BookingWizard from './components/BookingWizard';
import TenantDashboard from './components/TenantDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import AdminPanel from './components/AdminPanel';
import ChatSystem from './components/ChatSystem';

import { Car, Landmark, ShieldCheck, Mail, Phone, MapPin, Compass, MessageSquare, LayoutDashboard } from 'lucide-react';

export default function App() {
  // Global States
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  const [currentRole, setCurrentRole] = useState<Role>('PENYEWA');
  const [currentTab, setTab] = useState<string>('home'); // home | catalog | detail | chats | tenant-dashboard | owner-dashboard | admin-panel | wizard

  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [wishlist, setWishlist] = useState<string[]>(['v-1', 'v-3']); // Awal wishlist

  // State Detail & Booking Options
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('v-1');
  const [bookingOptions, setBookingOptions] = useState<any>({
    withDriver: false,
    startDate: '2026-06-25',
    endDate: '2026-06-28',
    days: 3,
    finalTotal: 2250000,
    depositAmount: 675000
  });

  // State pencarian filter catalog
  const [searchFilters, setSearchFilters] = useState<any>({
    city: 'Jakarta',
    vehicleType: 'ALL',
    startDate: '',
    endDate: ''
  });

  // Event handler Tambah / Update Wishlist
  const handleAddToWishlist = (vehicleId: string) => {
    if (wishlist.includes(vehicleId)) {
      setWishlist(wishlist.filter(id => id !== vehicleId));
    } else {
      setWishlist([...wishlist, vehicleId]);
    }
  };

  // Pilih unit kendaraan
  const handleSelectVehicle = (id: string) => {
    if (id) {
      setSelectedVehicleId(id);
      setTab('detail');
    } else {
      setTab('catalog');
    }
  };

  // Navigasi ke Wizard Booking
  const handleStartBooking = (vehicleId: string, options: any) => {
    setSelectedVehicleId(vehicleId);
    setBookingOptions(options);
    setTab('wizard');
  };

  // Sukses pembookingan
  const handleBookingSuccess = (newBooking: Booking) => {
    setBookings([newBooking, ...bookings]);
  };

  // Skenario Host: tambah armada baru
  const handleAddVehicle = (newUnit: Vehicle) => {
    setVehicles([newUnit, ...vehicles]);
  };

  // Skenario Host: hapus kendaraan
  const handleDeleteVehicle = (vehicleId: string) => {
    setVehicles(vehicles.filter(v => v.id !== vehicleId));
    alert('Sukses menghapus armada unit kendaraan dari pendaftaran RentaKu.');
  };

  // Skenario Host: persetujuan order masuk
  const handleAcceptBooking = (bookingId: string) => {
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'AKTIF', paymentStatus: 'SUCCESS' } : b));
    alert('Pemesanan disetujui! Kode handover QR sewa dan modul sistem GPS pelacak telah diaktifkan secara digital.');
  };

  const handleRejectBooking = (bookingId: string) => {
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'DIBATALKAN' } : b));
    alert('Pemesanan berhasil ditolak.');
  };

  // Skenario Admin: persetujuan KYC
  const handleApproveKyc = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, kycStatus: 'TERVERIFIKASI' } : u));
    if (currentUser.id === userId) {
      setCurrentUser({ ...currentUser, kycStatus: 'TERVERIFIKASI' });
    }
    alert('KYC Pengguna disetujui otomatis! Selesai dimoderasi.');
  };

  const handleRejectKyc = (userId: string, reason: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, kycStatus: 'DITOLAK', kycReason: reason } : u));
    if (currentUser.id === userId) {
      setCurrentUser({ ...currentUser, kycStatus: 'DITOLAK', kycReason: reason });
    }
    alert(`KYC Pengguna berhasil ditolak dengan alasan: ${reason}`);
  };

  const currentVehicleObj = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="rentaku-app-root">
      
      {/* HEADER NAVBAR BAR */}
      <Header 
        currentUser={currentUser}
        currentRole={currentRole}
        setCurrentRole={(r) => {
          setCurrentRole(r);
          // Ganti profil user tiruan berdasarkan role agar data relevan
          const findUser = users.find(u => u.role === r) || users[0];
          setCurrentUser(findUser);
        }}
        currentTab={currentTab}
        setTab={setTab}
        wishlistCount={wishlist.length}
      />

      {/* VIEWPORT AREA RESPONSIVE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex-1 w-full">
        
        {currentTab === 'home' && (
          <HomeView 
            vehicles={vehicles}
            onSelectVehicle={handleSelectVehicle}
            onSearch={(filters) => {
              setSearchFilters(filters);
            }}
            setTab={setTab}
            onAddToWishlist={handleAddToWishlist}
            wishlist={wishlist}
          />
        )}

        {currentTab === 'catalog' && (
          <CatalogsView 
            vehicles={vehicles}
            onSelectVehicle={handleSelectVehicle}
            filters={searchFilters}
            onAddToWishlist={handleAddToWishlist}
            wishlist={wishlist}
          />
        )}

        {currentTab === 'detail' && (
          <DetailView 
            vehicle={currentVehicleObj}
            currentUser={currentUser}
            onStartBooking={handleStartBooking}
            onBackToCatalog={() => setTab('catalog')}
            onOpenChat={() => setTab('chats')}
            wishlist={wishlist}
            onAddToWishlist={handleAddToWishlist}
          />
        )}

        {currentTab === 'wizard' && (
          <BookingWizard 
            vehicle={currentVehicleObj}
            currentUser={currentUser}
            onBookingSuccess={handleBookingSuccess}
            onCancel={() => setTab('home')}
            bookingOptions={bookingOptions}
          />
        )}

        {currentTab === 'tenant-dashboard' && (
          <TenantDashboard 
            currentUser={currentUser}
            onUpdateKycStatus={() => {}}
            bookings={bookings.filter(b => b.renterId === currentUser.id)}
            wishlist={wishlist}
            onSelectVehicle={handleSelectVehicle}
            onOpenChat={() => setTab('chats')}
          />
        )}

        {currentTab === 'owner-dashboard' && (
          <OwnerDashboard 
            currentUser={currentUser}
            vehicles={vehicles.filter(v => v.ownerId === currentUser.id)}
            bookings={bookings.filter(b => b.ownerId === currentUser.id)}
            onAddVehicle={handleAddVehicle}
            onAcceptBooking={handleAcceptBooking}
            onRejectBooking={handleRejectBooking}
            onDeleteVehicle={handleDeleteVehicle}
          />
        )}

        {currentTab === 'admin-panel' && (
          <AdminPanel 
            currentUser={currentUser}
            users={users}
            vehicles={vehicles}
            onApproveKyc={handleApproveKyc}
            onRejectKyc={handleRejectKyc}
            onApproveVehicle={() => {}}
            onRejectVehicle={() => {}}
          />
        )}

        {currentTab === 'chats' && (
          <ChatSystem currentUser={currentUser} />
        )}

      </main>

      {/* FOOTER PREMIUM BRAND */}
      <footer className="bg-slate-900 text-white mt-16 border-t border-slate-800" id="rentaku-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left text-sm">
            
            {/* Kolom Logo brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-600 p-2 rounded-xl text-white">
                  <Car className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold font-display text-white">RentaKu PRO</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Platform web persewaan mobil & motor terverifikasi nomor #1 untuk pasar Indonesia. Menggunakan enkripsi KYC nirlaba serta pelacak darurat GPS nirkabel.
              </p>
            </div>

            {/* Kolom navigasi link */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Tautan Cepat</h4>
              <ul className="space-y-1.5 text-xs text-slate-400 font-semibold">
                <li><button onClick={() => setTab('home')} className="hover:text-emerald-500 hover:underline">Jelajah Unit</button></li>
                <li><button onClick={() => setTab('catalog')} className="hover:text-emerald-500 hover:underline">Cari Kendaraan</button></li>
                <li><button onClick={() => setTab('tenant-dashboard')} className="hover:text-emerald-500 hover:underline">Dasbor Sewa Anda</button></li>
              </ul>
            </div>

            {/* Kolom pilar keamanan */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Pusat Keamanan</h4>
              <ul className="space-y-1.5 text-xs text-slate-400 font-semibold">
                <li className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> <span>Validasi KYC OCR</span></li>
                <li className="flex items-center gap-1.5"><Landmark className="w-4 h-4 text-emerald-500" /> <span>Ambil Alih Sengketa</span></li>
                <li className="flex items-center gap-1.5"><Car className="w-4 h-4 text-emerald-500" /> <span>Engine GPS Remote Control</span></li>
              </ul>
            </div>

            {/* Kolom Kontak info */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Hubungi Kami</h4>
              <ul className="space-y-1.5 text-xs text-slate-400 leading-normal font-medium">
                <li className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-emerald-500" /> <span>support@rentaku.com</span></li>
                <li className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-emerald-500" /> <span>+62-8123-4567-890</span></li>
                <li className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-emerald-500" /> <span>Kawasan Jabodetabek, Jakarta</span></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500 font-semibold flex flex-col sm:flex-row justify-between items-center gap-4">
            <span>© 2026 PT RentaKu Digital Nusantara. Seluruh data pengguna terlindungi enkripsi end-to-end.</span>
            <div className="flex gap-4">
              <span className="hover:underline cursor-pointer">Syarat Ketentuan Sewa</span>
              <span className="hover:underline cursor-pointer">Kebijakan Privasi</span>
            </div>
          </div>
        </div>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xl flex justify-around items-center h-16 z-50 py-1.5 px-3">
        <button
          onClick={() => setTab('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
            currentTab === 'home' ? 'text-emerald-700 bg-emerald-50/70 font-extrabold' : 'text-slate-500 font-semibold'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[9px] mt-1 font-sans">Jelajah</span>
        </button>
        <button
          onClick={() => setTab('catalog')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
            currentTab === 'catalog' ? 'text-emerald-700 bg-emerald-50/70 font-extrabold' : 'text-slate-500 font-semibold'
          }`}
        >
          <Car className="w-5 h-5" />
          <span className="text-[9px] mt-1 font-sans">Cari</span>
        </button>
        <button
          onClick={() => setTab('chats')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all relative ${
            currentTab === 'chats' ? 'text-emerald-700 bg-emerald-50/70 font-extrabold' : 'text-slate-500 font-semibold'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute top-1 right-5 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white"></span>
          <span className="text-[9px] mt-1 font-sans">Chat</span>
        </button>
        <button
          onClick={() => {
            if (currentRole === 'PENYEWA') setTab('tenant-dashboard');
            if (currentRole === 'PEMILIK') setTab('owner-dashboard');
            if (currentRole === 'ADMIN') setTab('admin-panel');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
            ['tenant-dashboard', 'owner-dashboard', 'admin-panel'].includes(currentTab) ? 'text-emerald-700 bg-emerald-50/70 font-extrabold' : 'text-slate-500 font-semibold'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[9px] mt-1 font-sans">Dasbor</span>
        </button>
      </div>

    </div>
  );
}
