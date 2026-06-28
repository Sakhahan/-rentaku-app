import React, { useState } from 'react';
import { User, Role } from '../types';
import { useLanguage } from '../lib/LanguageContext';
import { 
  Car, 
  ShieldAlert, 
  User as UserIcon, 
  Compass, 
  PlusCircle, 
  LayoutDashboard, 
  ShieldCheck, 
  Bell, 
  MessageSquare,
  Sparkles,
  RefreshCw,
  LogOut,
  Globe
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  currentTab: string;
  setTab: (tab: string) => void;
  wishlistCount: number;
}

export default function Header({
  currentUser,
  currentRole,
  setCurrentRole,
  currentTab,
  setTab,
  wishlistCount
}: HeaderProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const notifications = [
    { id: 1, title: language === 'ID' ? 'Pembayaran Berhasil!' : 'Payment Successful!', body: language === 'ID' ? 'Pembayaran sewa Toyota Innova telah diverifikasi otomatis via Midtrans.' : 'Toyota Innova rent payment verified automatically via Midtrans.', time: language === 'ID' ? '2 menit yang lalu' : '2 mins ago' },
    { id: 2, title: language === 'ID' ? 'Peringatan Pengembalian' : 'Return Warning', body: language === 'ID' ? 'Harap selesaikan check-in selfie harian sewa Anda dalam 1 jam.' : 'Please complete your daily selfie rent check-in in 1 hour.', time: language === 'ID' ? '1 jam yang lalu' : '1 hour ago' },
    { id: 3, title: language === 'ID' ? 'Selamat, KYC Terverifikasi!' : 'Congratulations, KYC Verified!', body: language === 'ID' ? 'Verifikasi dokumen identitas Anda disetujui oleh Admin.' : 'Your ID documents have been approved by the Admin.', time: language === 'ID' ? '1 hari yang lalu' : '1 day ago' }
  ];


  const getKycBadgeColor = () => {
    switch (currentUser.kycStatus) {
      case 'TERVERIFIKASI':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SEDANG_DITINJAU':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DITOLAK':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => setTab('home')}>
            <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center">
              <Car className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold font-display tracking-tight text-slate-900 flex items-center gap-1 sm:gap-1.5">
                RentaKu <span className="text-[10px] sm:text-xs bg-emerald-100 text-emerald-800 font-semibold px-1.5 sm:px-2 py-0.5 rounded-full">PRO</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-500 tracking-wider uppercase font-medium">Safe & Premium Rental</span>
            </div>
          </div>

          {/* Navigasi Utama */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setTab('home')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'home' 
                  ? 'bg-slate-50 text-emerald-600 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4" /> {t('nav.explore')}
              </span>
            </button>
            <button
              onClick={() => setTab('catalog')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'catalog' 
                  ? 'bg-slate-50 text-emerald-600 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Car className="w-4 h-4" /> {t('nav.find_vehicle')}
              </span>
            </button>
            <button
              onClick={() => setTab('chats')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                currentTab === 'chats' 
                  ? 'bg-slate-50 text-emerald-600 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> {t('nav.chats')}
                <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
              </span>
            </button>
          </nav>

          {/* Sisi Kanan (Akun & Notifikasi) */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Language Selector (Single Box, with Icon, No Flag) */}
            <button
              onClick={() => setLanguage(language === 'ID' ? 'EN' : 'ID')}
              className="flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 text-xs font-extrabold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all shadow-sm shrink-0"
              title={language === 'ID' ? 'Switch to English' : 'Ubah ke Bahasa Indonesia'}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language}</span>
            </button>

            {/* Quick Switch Role */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1 sm:gap-2 text-xs bg-slate-50 border border-slate-200 text-slate-700 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
                <span className="text-[11px] sm:text-xs font-semibold">
                  <span className="hidden md:inline">{t('nav.mode')}: </span>
                  <strong className="text-emerald-700">{currentRole === 'PEMILIK' ? (language === 'ID' ? 'PEMILIK' : 'OWNER') : currentRole === 'PENYEWA' ? (language === 'ID' ? 'PENYEWA' : 'RENTER') : 'ADMIN'}</strong>
                </span>
              </button>
              
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    {t('nav.change_mode')}
                  </div>
                  {(['PENYEWA', 'PEMILIK', 'ADMIN'] as Role[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setCurrentRole(r);
                        setShowRoleMenu(false);
                        if (r === 'PENYEWA') setTab('tenant-dashboard');
                        if (r === 'PEMILIK') setTab('owner-dashboard');
                        if (r === 'ADMIN') setTab('admin-panel');
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-all ${
                        currentRole === r 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {r === 'PENYEWA' && <UserIcon className="w-3.5 h-3.5" />}
                      {r === 'PEMILIK' && <PlusCircle className="w-3.5 h-3.5" />}
                      {r === 'ADMIN' && <ShieldCheck className="w-3.5 h-3.5" />}
                      {r === 'ADMIN' ? 'Admin' : r === 'PEMILIK' ? (language === 'ID' ? 'Pemilik (Host)' : 'Owner (Host)') : (language === 'ID' ? 'Penyewa' : 'Renter')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tombol Menuju Dashboard Tergantung Role Akses */}
            <button
              onClick={() => {
                if (currentRole === 'PENYEWA') setTab('tenant-dashboard');
                if (currentRole === 'PEMILIK') setTab('owner-dashboard');
                if (currentRole === 'ADMIN') setTab('admin-panel');
              }}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>
                {language === 'ID' 
                  ? `Dashboard ${currentRole === 'ADMIN' ? 'Admin' : currentRole === 'PEMILIK' ? 'Host' : 'Sewa'}`
                  : `Dashboard ${currentRole === 'ADMIN' ? 'Admin' : currentRole === 'PEMILIK' ? 'Host' : 'Rent'}`
                }
              </span>
            </button>

            {/* Notification Badge */}
            <div className="relative">
              <button
                onClick={() => setShowNotification(!showNotification)}
                className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-emerald-600 transition-all border border-slate-100"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 bg-rose-500 w-2 h-2 rounded-full ring-2 ring-white"></span>
              </button>

              {showNotification && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex justify-between items-center px-4 py-2 border-b border-slate-50">
                    <span className="font-bold text-sm text-slate-800">
                      {language === 'ID' ? 'Notifikasi Terkini' : 'Recent Notifications'}
                    </span>
                    <span className="text-xs text-emerald-600 font-semibold cursor-pointer">
                      {language === 'ID' ? 'Tandai Baca' : 'Mark as Read'}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-4 hover:bg-slate-50 transition-all cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 mt-1.5 bg-emerald-500 rounded-full flex-shrink-0"></div>
                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-slate-800">{notif.title}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{notif.body}</p>
                            <span className="text-[9px] text-slate-400 mt-1 block">{notif.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & KYC Ring */}
            <div 
              onClick={() => {
                if (currentRole === 'PENYEWA') setTab('tenant-dashboard');
                else if (currentRole === 'PEMILIK') setTab('owner-dashboard');
                else setTab('admin-panel');
              }}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="relative">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-emerald-500 transition-all"
                />
                <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center ${
                  currentUser.kycStatus === 'TERVERIFIKASI' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}>
                  {currentUser.kycStatus === 'TERVERIFIKASI' ? (
                    <ShieldCheck className="w-2.5 h-2.5 text-white" />
                  ) : (
                    <ShieldAlert className="w-2.5 h-2.5 text-white" />
                  )}
                </span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</span>
                <span className={`text-[9px] font-semibold mt-1 px-1.5 py-0.5 border rounded-full leading-none w-max ${getKycBadgeColor()}`}>
                  KYC {currentUser.kycStatus}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
