export type Role = 'PENYEWA' | 'PEMILIK' | 'ADMIN';
export type KYCStatus = 'MENUNGGU' | 'SEDANG_DITINJAU' | 'TERVERIFIKASI' | 'DITOLAK';
export type VehicleType = 'MOBIL' | 'MOTOR';
export type TransmissionType = 'MANUAL' | 'OTOMATIS';
export type FuelType = 'BENSIN' | 'DIESEL' | 'LISTRIK';
export type BookingStatus = 'MENUNGGU_PEMBAYARAN' | 'MENUNGGU_KONFIRMASI' | 'DISETUJUI' | 'AKTIF' | 'SELESAI' | 'DIBATALKAN' | 'SENGKETA';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'REFUNDED';
export type DepositStatus = 'HOLD' | 'RELEASED' | 'CLAIMED';

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  avatarUrl: string;
  role: Role;
  kycStatus: KYCStatus;
  kycReason?: string;
  points: number;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  ownerRating: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  type: VehicleType;
  transmission: TransmissionType;
  fuel: FuelType;
  passengerCapacity: number;
  cc?: number;
  description: string;
  dailyRate: number;
  weekendRate?: number;
  weeklyDiscount: number; // %
  monthlyDiscount: number; // %
  hasDriverOption: boolean;
  driverRate: number;
  rating: number;
  reviewCount: number;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'INACTIVE';
  isFeatured: boolean;
  photos: string[];
  features: string[];
  rules: string[];
  location: string;
  gpsDeviceId?: string;
}

export interface Booking {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePhoto: string;
  renterId: string;
  renterName: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  deliveryMethod: 'PICKUP' | 'DELIVERY';
  deliveryAddress?: string;
  deliveryFee: number;
  basePrice: number;
  addonPrice: number;
  depositAmount: number;
  totalPrice: number;
  status: BookingStatus;
  qrCodeHandover: string;
  emergencyContacts: {
    name: string;
    phone: string;
    relationship: string;
  }[];
  paymentMethod?: string;
  paymentStatus: PaymentStatus;
  depositStatus: DepositStatus;
  rentalAgreementSigned: boolean;
}

export interface DamageReport {
  id: string;
  bookingId: string;
  reportedBy: string;
  description: string;
  photos: string[];
  estimatedCost: number;
  status: 'MENUNGGU_MEDIASI' | 'TERSELESAIKAN';
  adminNotes?: string;
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  messageText: string;
  mediaUrl?: string;
  createdAt: string;
}

export interface Voucher {
  code: string;
  discountValue?: number;
  discountPercentage?: number;
  minBookingValue: number;
  description: string;
}
