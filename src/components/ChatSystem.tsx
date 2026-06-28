import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../types';
import { Send, Image, ShieldAlert, CheckCheck, Smile, MessageCircle, ExternalLink, RefreshCw, Zap, UserCheck, Bot, ShieldCheck, Check } from 'lucide-react';

interface ChatSystemProps {
  currentUser: User;
}

export default function ChatSystem({ currentUser }: ChatSystemProps) {
  // Daftar pesan inisiasi awal
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      bookingId: 'B-RE-202602',
      senderId: 'user-owner-1',
      senderName: 'Hendra Wijaya',
      messageText: 'Halo mas Budi, mobil Innova Zenix sudah saya cuci bersih, bensin Pertamax lunas penuh, wangi. Posisi penjemputan di lobby sebelah barat ya.',
      createdAt: '2026-06-20T10:00:00Z'
    },
    {
      id: 'm-2',
      bookingId: 'B-RE-202602',
      senderId: 'user-renter-1',
      senderName: 'Budi Prasetyo',
      messageText: 'Siap mas Hendra, mantap sekali servisnya. Saya dalam perjalanan ojek online menuju lokasi sewa sisa 10 menit lagi sampai.',
      createdAt: '2026-06-20T10:02:00Z'
    },
    {
      id: 'm-3',
      bookingId: 'B-RE-202602',
      senderId: 'user-owner-1',
      senderName: 'Hendra Wijaya',
      messageText: 'Ok mas santai saja berhati-hati di jalan. Jangan lupa siapkan barcode QR handover sewa di aplikasi RentaKu untuk scan serah terima ya.',
      createdAt: '2026-06-20T10:03:00Z'
    }
  ]);

  // Siapa yang sedang aktif mengetik di Simulator Chat ini
  // Default adalah 'user-renter-1' (Budi - Penyewa) jika user bukan pemilik, jika pemilik maka default ke 'user-owner-1'
  const [activeSenderId, setActiveSenderId] = useState<string>(
    currentUser.id === 'user-owner-1' ? 'user-owner-1' : 'user-renter-1'
  );

  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [enableAutoReply, setEnableAutoReply] = useState(true);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Profile data untuk dua partisipan utama
  const participantBudi = {
    id: 'user-renter-1',
    name: 'Budi Prasetyo',
    roleLabel: 'Penyewa Unit',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    color: 'emerald'
  };

  const participantHendra = {
    id: 'user-owner-1',
    name: 'Hendra Wijaya',
    roleLabel: 'Host Pemilik (Toyota Innova)',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    color: 'blue'
  };

  // Tentukan siapa target penerima chat saat ini
  const activeRecipient = activeSenderId === 'user-renter-1' ? participantHendra : participantBudi;
  const activeSender = activeSenderId === 'user-renter-1' ? participantBudi : participantHendra;

  // Auto-scroll ke bawah saat ada pesan baru
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Pool Smart Auto Reply logic
  const getSmartReply = (inputText: string, senderId: string): string => {
    const text = inputText.toLowerCase();
    
    // Jika pengirimnya Penyewa (Budi), maka Pemilik (Hendra) yang menjawab
    if (senderId === 'user-renter-1') {
      if (text.includes('ready') || text.includes('ada') || text.includes('tersedia') || text.includes('kosong')) {
        return 'Tentu mas, unit Toyota Innova Zenix Hybrid kami selalu siap sedia dalam kondisi prima. Silakan langsung diajukan sewa!';
      }
      if (text.includes('nego') || text.includes('harga') || text.includes('kurang') || text.includes('diskon') || text.includes('murah')) {
        return 'Waduh mas, tarif sewa harian Rp 750.000 sudah sangat nett dan paling murah dibanding yang lain. Sudah termasuk asuransi modul RentaKu PRO lho!';
      }
      if (text.includes('lokasi') || text.includes('ambil') || text.includes('jemput') || text.includes('alamat')) {
        return 'Lokasi serah terima utama ada di Lobby Barat Apartemen Mediterania Jakarta Barat. Nanti bisa kita sesuaikan titik persisnya ya mas.';
      }
      if (text.includes('bensin') || text.includes('solar') || text.includes('pertamax')) {
        return 'Unit selalu kami serahkan dengan bensin full (Pertamax). Aturan di RentaKu adalah Full-to-Full, jadi kembalinya diisi penuh juga ya mas.';
      }
      if (text.includes('sim') || text.includes('ktp') || text.includes('syarat') || text.includes('jaminan')) {
        return 'Syaratnya praktis banget mas, cukup unggah KTP dan SIM A aktif di verifikasi akun RentaKu Anda. Tidak perlu jaminan ribet!';
      }
      if (text.includes('wa') || text.includes('whatsapp') || text.includes('nomor') || text.includes('telp')) {
        return 'Tentu mas, nomor WA saya ada di pojok kanan atas layar chat ini (0813-8550-7712). Hubungi saja jika butuh darurat!';
      }
      return 'Siap mas Budi! Pesan telah saya terima dengan baik. Ada kelengkapan unit atau jadwal yang ingin dipastikan lagi?';
    } 
    
    // Jika pengirimnya Pemilik (Hendra), maka Penyewa (Budi) yang menjawab
    else {
      if (text.includes('ready') || text.includes('siap') || text.includes('bersih') || text.includes('cuci')) {
        return 'Mantap mas Hendra! Terima kasih banyak atas persiapannya. Saya suka sekali mobil yang wangi dan bersih.';
      }
      if (text.includes('jemput') || text.includes('ambil') || text.includes('lobby') || text.includes('barat')) {
        return 'Oke baik mas, saya akan langsung menuju Lobby Barat. Nanti saya infokan begitu ojek online saya sudah hampir sampai.';
      }
      if (text.includes('bensin') || text.includes('pertamax')) {
        return 'Siap mas Hendra, nanti sebelum saya pulangkan unitnya pasti saya mampir pom bensin untuk isi Pertamax full lagi.';
      }
      if (text.includes('qr') || text.includes('handover') || text.includes('scan')) {
        return 'Baik mas, barcode QR serah terima sudah saya siapkan di halaman Sewa Aktif saya. Nanti langsung discan saja begitu ketemu.';
      }
      if (text.includes('deposit') || text.includes('jaminan') || text.includes('transfer')) {
        return 'Sudah aman mas, dana sewa dan jaminan deposit sudah didepositkan ke rekening bersama RentaKu. Nanti setelah trip selesai mohon dibantu rilis ya.';
      }
      return 'Baik mas Hendra, terima kasih banyak atas infonya! Sangat puas berinteraksi dengan Anda di RentaKu.';
    }
  };

  const handleSendMessageText = (textToSend: string, senderId: string, senderName: string) => {
    const newMsg: ChatMessage = {
      id: `m-live-${Date.now()}`,
      bookingId: 'B-RE-202602',
      senderId: senderId,
      senderName: senderName,
      messageText: textToSend,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);

    // Triger simulasi balasan otomatis dari pihak seberang
    if (enableAutoReply) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const oppositeSenderId = senderId === 'user-renter-1' ? 'user-owner-1' : 'user-renter-1';
        const oppositeSenderName = senderId === 'user-renter-1' ? 'Hendra Wijaya' : 'Budi Prasetyo';
        const replyText = getSmartReply(textToSend, senderId);
        
        const replyMsg: ChatMessage = {
          id: `m-reply-${Date.now()}`,
          bookingId: 'B-RE-202602',
          senderId: oppositeSenderId,
          senderName: oppositeSenderName,
          messageText: replyText,
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, replyMsg]);
      }, 1500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedText.trim()) return;
    
    const senderName = activeSenderId === 'user-renter-1' ? 'Budi Prasetyo' : 'Hendra Wijaya';
    handleSendMessageText(typedText, activeSenderId, senderName);
    setTypedText('');
  };

  // Daftar templates pertanyaan / jawaban instan FB Marketplace
  const quickTemplates = activeSenderId === 'user-renter-1' 
    ? [
        'Apakah unit Toyota Innova Zenix ini masih ready?',
        'Apakah harganya masih bisa dinego tipis mas?',
        'Lokasi serah terima persisnya di mana ya mas?',
        'Kondisi bensin terisi seberapa saat penjemputan?',
        'Syarat sewa lepas kunci apa saja ya mas Hendra?',
      ]
    : [
        'Halo mas Budi, unit Toyota Innova Zenix kami ready siap pakai!',
        'Harga sewa harian pas ya mas, sudah sangat bersaing.',
        'Serah terima unit bisa di Lobby Barat Apartemen ya.',
        'Bensin terisi penuh Pertamax mas, aman lancar siap luar kota.',
        'Persyaratan cukup KTP dan SIM A aktif saja di profil RentaKu Anda.',
      ];

  const handleResetChat = () => {
    if (window.confirm('Apakah Anda ingin menyetel ulang riwayat obrolan simulasi ini?')) {
      setMessages([
        {
          id: 'm-init',
          bookingId: 'B-RE-202602',
          senderId: 'user-owner-1',
          senderName: 'Hendra Wijaya',
          messageText: 'Halo mas Budi, selamat datang di fitur chat interaktif RentaKu! Silakan tanyakan apa saja perihal unit Toyota Innova Zenix kami.',
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  // Ambil pesan terakhir untuk ditampilkan di sisi kiri daftar chat
  const lastMessageText = messages.length > 0 ? messages[messages.length - 1].messageText : 'Tidak ada pesan';

  return (
    <div className="flex flex-col lg:flex-row bg-slate-100 border border-slate-200 rounded-3xl overflow-hidden min-h-[600px] shadow-lg text-left">
      
      {/* SISI KIRI: LIST CHAT PARTNERS & PERAN SEKARANG */}
      <div className="w-full lg:w-1/3 bg-white border-r border-slate-150 flex flex-col justify-between">
        <div>
          {/* Header Kotak Chat */}
          <div className="p-4 border-b flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                Kotak Chatting
              </h3>
              <p className="text-[10px] text-slate-550 leading-normal">Simulasi interaktif dua arah FB Marketplace.</p>
            </div>
            
            <button 
              onClick={handleResetChat}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-all flex items-center gap-1 text-[10px] font-bold"
              title="Reset Chat"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {/* Status Mode Simulator */}
          <div className="p-3.5 bg-amber-50 border-b border-amber-100 text-amber-900 text-[11px] leading-relaxed font-semibold">
            <span className="flex items-center gap-1.5 text-amber-800 font-bold mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              Saling Balas Seperti FB Marketplace
            </span>
            Klik kartu profil di bawah untuk bertukar peran membalas chat!
          </div>

          {/* Daftar Profil KYC Terverifikasi - Grid responsive 2 kolom di mobile/tablet, 1 kolom di desktop */}
          <div className="p-3 bg-slate-50 border-b">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Profil KYC Terverifikasi</span>
              <span className="bg-emerald-500 text-white font-extrabold text-[8px] px-2 py-0.5 rounded-full animate-pulse">2 AKUN VERIFIED</span>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
              {/* Profile Penyewa */}
              <div 
                onClick={() => setActiveSenderId('user-renter-1')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  activeSenderId === 'user-renter-1' 
                    ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative shrink-0">
                    <img 
                      src={participantBudi.avatarUrl} 
                      alt="" 
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-emerald-100"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div className="text-left space-y-0.5 overflow-hidden flex-1">
                    <div className="flex items-center gap-1">
                      <h4 className="font-extrabold text-[10.5px] sm:text-xs text-slate-900 truncate leading-none">
                        {participantBudi.name}
                      </h4>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 font-semibold leading-none">
                      {participantBudi.roleLabel}
                    </p>
                  </div>
                </div>

                {/* KYC Status Badge */}
                <div className="mt-2.5 flex items-center justify-between gap-1 flex-wrap">
                  <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[8.5px] px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>KYC OK</span>
                  </span>
                  {activeSenderId === 'user-renter-1' && (
                    <span className="bg-emerald-600 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-md">
                      Aktif
                    </span>
                  )}
                </div>
              </div>

              {/* Profile Pemilik */}
              <div 
                onClick={() => setActiveSenderId('user-owner-1')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  activeSenderId === 'user-owner-1' 
                    ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500/30' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative shrink-0">
                    <img 
                      src={participantHendra.avatarUrl} 
                      alt="" 
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-blue-100"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div className="text-left space-y-0.5 overflow-hidden flex-1">
                    <div className="flex items-center gap-1">
                      <h4 className="font-extrabold text-[10.5px] sm:text-xs text-slate-900 truncate leading-none">
                        {participantHendra.name}
                      </h4>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 font-semibold leading-none">
                      {participantHendra.roleLabel}
                    </p>
                  </div>
                </div>

                {/* KYC Status Badge */}
                <div className="mt-2.5 flex items-center justify-between gap-1 flex-wrap">
                  <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[8.5px] px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>KYC OK</span>
                  </span>
                  {activeSenderId === 'user-owner-1' && (
                    <span className="bg-blue-600 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-md">
                      Aktif
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Akun Sistem Utama */}
        <div className="p-4 bg-slate-50 text-[10.5px] text-slate-600 leading-relaxed border-t font-semibold hidden lg:block">
          <div className="flex items-center gap-2 mb-1.5 text-slate-800 font-bold">
            <UserCheck className="w-4 h-4 text-slate-500" />
            Akun Login Anda:
          </div>
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border">
            <img src={currentUser.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
            <div>
              <p className="font-extrabold text-[11px] text-slate-900 leading-none">{currentUser.name}</p>
              <p className="text-[9px] text-slate-400 font-bold">{currentUser.role === 'PEMILIK' ? 'PEMILIK HOST' : 'PENYEWA MEMBER'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SISI KANAN: DETIL PERCAKAPAN CHAT */}
      <div className="flex-1 flex flex-col justify-between bg-slate-50 relative">
        
        {/* Header Chat + Switcher Peran */}
        <div className="bg-white p-4 border-b flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center z-10 shadow-sm">
          
          <div className="flex gap-3 items-center">
            <img 
              src={activeRecipient.avatarUrl} 
              alt="" 
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="text-left space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-extrabold text-slate-900 text-sm leading-none">{activeRecipient.name}</h4>
                <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[9px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>KYC Verified</span>
                </span>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 leading-none uppercase mt-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Online Aktif
              </span>
            </div>
          </div>

          {/* Pengaturan Peran Live Simulator */}
          <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Peran Anda Mengetik Sekarang:</span>
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border w-full sm:w-auto">
              <button
                onClick={() => setActiveSenderId('user-renter-1')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10.5px] font-extrabold transition-all ${
                  activeSenderId === 'user-renter-1' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Penyewa (Budi)
              </button>
              <button
                onClick={() => setActiveSenderId('user-owner-1')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10.5px] font-extrabold transition-all ${
                  activeSenderId === 'user-owner-1' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Pemilik (Hendra)
              </button>
            </div>
          </div>

        </div>

        {/* Info Bar / Warning Simulasi */}
        <div className="bg-slate-100 px-4 py-2 border-b flex justify-between items-center text-[10.5px] font-bold text-slate-600">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Mengirim chat sebagai: <span className="text-slate-900 font-extrabold ml-1">{activeSender.name} ({activeSender.roleLabel})</span>
          </div>
          
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={enableAutoReply}
              onChange={(e) => setEnableAutoReply(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span className="flex items-center gap-0.5 text-slate-600">
              <Bot className="w-3 h-3 text-emerald-600" /> Balas Otomatis
            </span>
          </label>
        </div>

        {/* Message Bubble Field Scroll */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar max-h-[420px] bg-slate-50/50">
          {messages.map((msg) => {
            // isMe adalah TRUE jika pesan dikirim oleh peran yang saat ini Anda pilih untuk dikontrol
            const isMe = msg.senderId === activeSenderId;
            return (
              <div 
                key={msg.id}
                className={`flex max-w-[80%] flex-col ${isMe ? 'ml-auto text-right items-end' : 'mr-auto text-left items-start'}`}
              >
                <div className={`rounded-2xl p-3.5 text-xs font-semibold leading-relaxed shadow-sm ${
                  isMe 
                    ? activeSenderId === 'user-renter-1'
                      ? 'bg-emerald-600 text-white rounded-br-none' 
                      : 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white border text-slate-800 rounded-bl-none border-slate-200'
                }`}>
                  {msg.messageText}
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider">
                  <span>{msg.senderName}</span>
                  <span>•</span>
                  <span>Baru Saja</span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
              </div>
            );
          })}
          
          {isTyping && (
            <div className="flex max-w-[80%] flex-col mr-auto text-left items-start">
              <div className="bg-white border border-slate-200 text-slate-500 text-xs font-semibold rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center gap-2">
                <span className="text-[10px] text-slate-400 italic font-bold">{activeRecipient.name} sedang mengetik balasan...</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Facebook Marketplace Quick Message Templates */}
        <div className="bg-white px-3 py-2 border-t flex flex-col gap-1">
          <p className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider">
            ⚡ Template Pertanyaan Cepat ({activeSenderId === 'user-renter-1' ? 'Penyewa' : 'Pemilik'}):
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
            {quickTemplates.map((template, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  const name = activeSenderId === 'user-renter-1' ? 'Budi Prasetyo' : 'Hendra Wijaya';
                  handleSendMessageText(template, activeSenderId, name);
                }}
                className="bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 transition-all text-[10.5px] font-bold px-3 py-1.5 rounded-full shrink-0 text-slate-700 active:scale-95"
              >
                {template}
              </button>
            ))}
          </div>
        </div>

        {/* Action Input Text Box */}
        <form onSubmit={handleSubmit} className="bg-white border-t p-3 flex gap-3 items-center">
          <button 
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
            title="Kirim Foto Dokumen"
          >
            <Image className="w-5 h-5" />
          </button>
          
          <input 
            type="text" 
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
            placeholder={`Ketik balasan chat Anda sebagai ${activeSender.name}...`}
          />

          <button 
            type="submit"
            className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-500 transition-all flex items-center justify-center shadow-lg shadow-emerald-600/10"
            title="Kirim di Aplikasi"
          >
            <Send className="w-4 h-4" />
          </button>

          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              const text = typedText.trim() || 'Halo Hendra Wijaya, saya tertarik dengan unit sewa RentaKu Anda.';
              window.open(`https://wa.me/6281385507712?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="bg-emerald-500 text-white p-2.5 rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center shadow-lg shadow-emerald-500/10"
            title="Hubungi Resmi via WhatsApp"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </button>
        </form>

      </div>

    </div>
  );
}
