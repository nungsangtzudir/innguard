// TODO: refine this logic later

export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export enum RoomStatus {
  VACANT = 'VACANT',
  OCCUPIED = 'OCCUPIED',
  NEEDS_CLEANING = 'NEEDS_CLEANING'
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  fullName: string;
}

export interface Room {
  id: string;
  number: string;
  type: string;
  bedCount: number;
  basePrice: number;
  status: RoomStatus;
}

export interface Guest {
  id: string;
  name: string;
  address: string;
  phone: string;
  idProof?: string;
}

export interface Booking {
  id: string;
  roomId: string;
  guestId: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
  totalPrice: number;
}

export interface CheckInRecord extends Booking {
  actualCheckInTime: string;
  actualCheckOutTime?: string;
  extraCharges: ExtraCharge[];
}

export interface ExtraCharge {
  id: string;
  description: string;
  amount: number;
  quantity: number;
  date: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

export interface HotelSettings {
  name: string;
  address: string;
  phone: string;
  gstin?: string;
  logoUrl?: string;
  invoiceFooter: string;
}

export interface AppState {
  users: User[];
  rooms: Room[];
  guests: Guest[];
  bookings: Booking[];
  checkInRecords: CheckInRecord[];
  expenses: Expense[];
  settings: HotelSettings;
  currentUser: User | null;
}
