import React, { useState, useMemo } from 'react';
import { Vehicle } from '../types';
import { 
  SlidersHorizontal, 
  Star, 
  MapPin, 
  Maximize2, 
  Car, 
  Bike, 
  Grid, 
  List, 
  Heart,
  ChevronLeft,
  ChevronRight,
  Info,
  Search,
  X
} from 'lucide-react';

interface CatalogsViewProps {
  vehicles: Vehicle[];
  onSelectVehicle: (id: string) => void;
  filters: any;
  onAddToWishlist: (vehicleId: string) => void;
  wishlist: string[];
}

export default function CatalogsView({
  vehicles,
  onSelectVehicle,
  filters,
  onAddToWishlist,
  wishlist
}: CatalogsViewProps) {
  // State Filters
  const [vehicleType, setVehicleType] = useState<string>(filters?.vehicleType || 'ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('ALL');
  const [selectedFuel, setSelectedFuel] = useState<string>('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(1200000);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedFeature, setSelectedFeature] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('REKOMENDASI');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [searchQuery, setSearchQuery] = useState<string>(filters?.city || '');
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Slide index per vehicle card
  const [cardImageIndex, setCardImageIndex] = useState<{ [key: string]: number }>({});

  const brands = useMemo(() => {
    const list = vehicles.map(v => v.brand);
    return ['ALL', ...Array.from(new Set(list))];
  }, [vehicles]);

  const featuresList = useMemo(() => {
    const allFeats: string[] = [];
    vehicles.forEach(v => allFeats.push(...v.features));
    return ['ALL', ...Array.from(new Set(allFeats))];
  }, [vehicles]);

  const handleNextPhoto = (vehicleId: string, maxPhotos: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const curr = cardImageIndex[vehicleId] || 0;
    setCardImageIndex({
      ...cardImageIndex,
      [vehicleId]: (curr + 1) % maxPhotos
    });
  };

  const handlePrevPhoto = (vehicleId: string, maxPhotos: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const curr = cardImageIndex[vehicleId] || 0;
    setCardImageIndex({
      ...cardImageIndex,
      [vehicleId]: (curr - 1 + maxPhotos) % maxPhotos
    });
  };

  // Filtered Vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      // Tipe kendaraan
      if (vehicleType !== 'ALL' && vehicle.type !== vehicleType) return false;
      // Brand
      if (selectedBrand !== 'ALL' && vehicle.brand !== selectedBrand) return false;
      // Transmisi
      if (selectedTransmission !== 'ALL' && vehicle.transmission !== selectedTransmission) return false;
      // Bahan Bakar
      if (selectedFuel !== 'ALL' && vehicle.fuel !== selectedFuel) return false;
      // Harga harian
      if (vehicle.dailyRate > maxPrice) return false;
      // Rating minimum
      if (vehicle.rating < minRating) return false;
      // Fitur khusus
      if (selectedFeature !== 'ALL' && !vehicle.features.includes(selectedFeature)) return false;

      // Pencarian kata kunci (Search Query)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = vehicle.name.toLowerCase().includes(query);
        const matchesBrand = vehicle.brand.toLowerCase().includes(query);
        const matchesModel = vehicle.model.toLowerCase().includes(query);
        const matchesLoc = vehicle.location.toLowerCase().includes(query);
        const matchesDesc = (vehicle.description || '').toLowerCase().includes(query);
        const matchesFeatures = vehicle.features.some(f => f.toLowerCase().includes(query));
        const matchesType = vehicle.type.toLowerCase().includes(query);
        const matchesFuel = vehicle.fuel.toLowerCase().includes(query);
        const matchesTrans = vehicle.transmission.toLowerCase().includes(query);
        
        if (!matchesName && !matchesBrand && !matchesModel && !matchesLoc && !matchesDesc && !matchesFeatures && !matchesType && !matchesFuel && !matchesTrans) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'LUXURY') return b.dailyRate - a.dailyRate;
      if (sortBy === 'CHEAP') return a.dailyRate - b.dailyRate;
      if (sortBy === 'RATING') return b.rating - a.rating;
      return b.reviewCount - a.reviewCount; // REKOMENDASI / TERPOPULER
    });
  }, [vehicles, vehicleType, selectedBrand, selectedTransmission, selectedFuel, maxPrice, minRating, selectedFeature, sortBy, searchQuery]);

  return (
    <div className="space-y-6 pb-20 text-left w-full max-w-7xl mx-auto">
      
      {/* BAR PENCARIAN UTAMA - FULL WIDTH AT THE TOP */}
      <div className="relative group w-full bg-white border border-slate-200 rounded-2xl shadow-sm z-10">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-405 group-focus-within:text-emerald-600 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Cari nama unit, merek, tipe, spesifikasi transmisi/bakar, lokasi kota, atau fitur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-11 pr-12 py-3.5 bg-transparent border-0 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent rounded-2xl transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      {/* FILTER BAR KHUSUS MOBILE */}
      <div className="lg:hidden flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm w-full">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center gap-2 text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-extrabold shadow-sm transition-all"
        >
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          <span>{showMobileFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter / Atur Harga'}</span>
        </button>
        <div className="text-right">
          <span className="text-xs font-extrabold text-slate-800 block">
            {filteredVehicles.length} Unit
          </span>
          <span className="text-[10px] text-emerald-600 block font-bold">
            ✓ Terverifikasi Aktif
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full items-start">
        
        {/* SIDEBAR FILTER - COLLAPSIBLE ON MOBILE, ALWAYS OPEN & STICKY ON DESKTOP */}
        <aside className={`w-full lg:w-1/4 bg-white border border-slate-200/90 rounded-3xl p-6 space-y-6 shadow-sm lg:sticky lg:top-20 shrink-0 ${
          showMobileFilters ? 'block' : 'hidden lg:block'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-55 pb-4">
            <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <SlidersHorizontal className="w-4.5 h-4.5 text-emerald-600" /> Filter Pencarian
            </h2>
            <button 
              onClick={() => {
                setVehicleType('ALL');
                setSelectedBrand('ALL');
                setSelectedTransmission('ALL');
                setSelectedFuel('ALL');
                setMaxPrice(1200000);
                setMinRating(0);
                setSelectedFeature('ALL');
                setSortBy('REKOMENDASI');
                setSearchQuery('');
              }}
              className="text-xs text-emerald-600 font-bold hover:underline"
            >
              Reset
            </button>
          </div>

          {/* Jenis Kendaraan */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Jenis Unit</label>
            <div className="grid grid-cols-3 gap-2">
              {['ALL', 'MOBIL', 'MOTOR'].map((t) => (
                <button
                  key={t}
                  onClick={() => setVehicleType(t)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    vehicleType === t 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/15' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t === 'ALL' ? 'Semua' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Slider Rentang Harga */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold font-sans">
              <span className="text-slate-405 uppercase tracking-wider">Tarif Maksimal</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Rp {maxPrice.toLocaleString('id-ID')}</span>
            </div>
            <input 
              type="range"
              min={100000}
              max={1500000}
              step={50000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
              <span>Rp 100k</span>
              <span>Rp 1.5Jt</span>
            </div>
          </div>

          {/* Merek */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Pilih Merek</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 font-bold focus:ring-1 focus:ring-emerald-500"
            >
              {brands.map((b) => (
                <option key={b} value={b}>{b === 'ALL' ? 'Semua Merek' : b}</option>
              ))}
            </select>
          </div>

          {/* Transmisi */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Transmisi</label>
            <select
              value={selectedTransmission}
              onChange={(e) => setSelectedTransmission(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 font-bold focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Transmisi</option>
              <option value="MANUAL">MANUAL</option>
              <option value="OTOMATIS">OTOMATIS</option>
            </select>
          </div>

          {/* Bahan Bakar */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Bahan Bakar</label>
            <select
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-705 font-bold focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Jenis</option>
              <option value="BENSIN">Bensol/Bensin</option>
              <option value="DIESEL">Solar/Diesel</option>
              <option value="LISTRIK">Listrik/EV</option>
            </select>
          </div>

          {/* Fitur Tambahan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Fitur Unggulan</label>
            <select
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 font-bold focus:ring-1 focus:ring-emerald-500"
            >
              {featuresList.map((f) => (
                <option key={f} value={f}>{f === 'ALL' ? 'Semua Fitur' : f}</option>
              ))}
            </select>
          </div>

          {/* Rating Minimum */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Rating Minimum</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 3, 4, 4.5].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setMinRating(stars)}
                  className={`py-1.5 rounded-lg border text-xs font-extrabold flex items-center justify-center gap-1 transition-all ${
                    minRating === stars
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Star className={`w-3 h-3 ${minRating === stars ? 'fill-emerald-600 text-emerald-600' : 'text-slate-400'}`} />
                  {stars === 0 ? 'Semua' : `${stars}+`}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* HASIL KATALOG */}
        <main className="flex-1 space-y-6 w-full lg:w-3/4">
          
          {/* HEADER TOOLBAR */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm w-full">
            <div>
              <h1 className="font-extrabold text-slate-900 text-lg tracking-tight">Katalog Pilihan Kendaraan</h1>
              <p className="text-xs text-slate-500 mt-0.5">Ditemukan <strong className="text-emerald-700">{filteredVehicles.length}</strong> unit terverifikasi aktif</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Urutan */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-750 font-bold focus:outline-none"
              >
                <option value="REKOMENDASI">Urutkan: Terpopuler</option>
                <option value="CHEAP">Urutkan: Tarif Termurah</option>
                <option value="LUXURY">Urutkan: Tarif Termahal</option>
                <option value="RATING">Urutkan: Rating Tertinggi</option>
              </select>
  

            {/* Toggle Gird/List */}
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden self-stretch bg-slate-50">
              <button 
                onClick={() => setViewMode('GRID')}
                className={`p-2 transition-all ${viewMode === 'GRID' ? 'bg-white text-emerald-600' : 'text-slate-400'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('LIST')}
                className={`p-2 transition-all ${viewMode === 'LIST' ? 'bg-white text-emerald-600' : 'text-slate-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* JIKA DATA KOSONG */}
        {filteredVehicles.length === 0 && (
          <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="bg-amber-100 text-amber-700 w-16 h-16 rounded-full mx-auto flex items-center justify-center">
              <Info className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Pencarian Tidak Ditemukan</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Maaf, tidak ada unit yang memenuhi kriteria filter Anda. Silakan reset filter atau gunakan setelan harga yang lebih bervariasi.
            </p>
            <button
              onClick={() => {
                setVehicleType('ALL');
                setSelectedBrand('ALL');
                setSelectedTransmission('ALL');
                setSelectedFuel('ALL');
                setMaxPrice(1200000);
                setMinRating(0);
                setSelectedFeature('ALL');
                setSortBy('REKOMENDASI');
              }}
              className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-emerald-500 transition-all font-display"
            >
              Setel Ulang Filter
            </button>
          </div>
        )}

        {/* LIST CARDS */}
        <div className={viewMode === 'GRID' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
          {filteredVehicles.map((vehicle) => {
            const isWishlist = wishlist.includes(vehicle.id);
            const activePhotoIndex = cardImageIndex[vehicle.id] || 0;
            const maxPhotos = vehicle.photos.length;

            return (
              <div 
                key={vehicle.id}
                className={`bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all cursor-pointer flex ${
                  viewMode === 'GRID' ? 'flex-col justify-between' : 'flex-col sm:flex-row'
                }`}
                onClick={() => onSelectVehicle(vehicle.id)}
              >
                {/* Image Section */}
                <div className={`relative bg-slate-50 ${viewMode === 'GRID' ? 'w-full aspect-video' : 'w-full sm:w-1/3 aspect-video sm:aspect-square md:aspect-video flex-shrink-0'}`}>
                  <img
                    src={vehicle.photos[activePhotoIndex]}
                    alt={vehicle.name}
                    className="w-full h-full object-cover select-none"
                  />

                  {/* Manual Carousel Buttons */}
                  {maxPhotos > 1 && (
                    <>
                      <button
                        onClick={(e) => handlePrevPhoto(vehicle.id, maxPhotos, e)}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white text-slate-800 rounded-full shadow-md backdrop-blur-sm transition-all"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleNextPhoto(vehicle.id, maxPhotos, e)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white text-slate-800 rounded-full shadow-md backdrop-blur-sm transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      {/* Dots */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full">
                        {vehicle.photos.map((_, dotIdx) => (
                          <div 
                            key={dotIdx}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${dotIdx === activePhotoIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Location Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[10px] font-extrabold text-slate-900 px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{vehicle.location}</span>
                  </div>

                  {/* Wishlist */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToWishlist(vehicle.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm hover:scale-110 transition-all"
                  >
                    <Heart className={`w-4 h-4 ${isWishlist ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
                  </button>
                </div>

                {/* Content Section */}
                <div className={`p-5 flex-1 flex flex-col justify-between ${viewMode === 'GRID' ? 'h-auto' : 'pl-6'}`}>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
                      <span>{vehicle.type} • {vehicle.transmission} • {vehicle.fuel}</span>
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> {vehicle.rating.toFixed(2)} ({vehicle.reviewCount})
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-950 text-base sm:text-lg tracking-tight group-hover:text-emerald-600">{vehicle.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{vehicle.description}</p>

                    {/* Meta info bar */}
                    <div className="flex gap-4 pt-3 text-[11px] text-slate-400 font-bold border-t border-b border-slate-50 py-2 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{vehicle.passengerCapacity} Kursi</span>
                      </div>
                      {vehicle.cc && (
                        <div className="flex items-center gap-1.5">
                          <Bike className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{vehicle.cc} CC</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-extrabold">
                        <span>Pesan Langsung</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Pricing Footer */}
                  <div className="flex items-center justify-between pt-4 mt-3">
                    <div>
                      <span className="text-[10px] block text-slate-400 font-bold uppercase tracking-wider">Sewa/Hari</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-extrabold text-slate-950">
                          Rp {vehicle.dailyRate.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    <button className="bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-1.5">
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      </div>
    </div>
  );
}
