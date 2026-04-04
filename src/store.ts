// TODO: refine this logic later

import { AppState, UserRole, RoomStatus, HotelSettings } from './types';

const STORAGE_KEY = 'innguard_hms_data';

const DEFAULT_SETTINGS: HotelSettings = {
  name: 'Grand Royal Hotel',
  address: '123 MG Road, Bengaluru, Karnataka, 560001',
  phone: '+91 80 2222 3333',
  gstin: '29AAAAA0000A1Z5',
  invoiceFooter: 'Thank you for staying with us! Please come again.'
};

const INITIAL_STATE: AppState = {
  users: [
    { id: '1', username: 'admin', passwordHash: 'admin123', role: UserRole.ADMIN, fullName: 'System Administrator' },
    { id: '2', username: 'staff', passwordHash: 'staff123', role: UserRole.STAFF, fullName: 'Front Desk Agent' }
  ],
  rooms: [
    { id: '101', number: '101', type: 'Single', bedCount: 1, basePrice: 1500, status: RoomStatus.VACANT },
    { id: '102', number: '102', type: 'Double', bedCount: 2, basePrice: 2500, status: RoomStatus.VACANT },
    { id: '201', number: '201', type: 'Deluxe', bedCount: 2, basePrice: 4500, status: RoomStatus.VACANT },
    { id: '202', number: '202', type: 'Suite', bedCount: 3, basePrice: 7500, status: RoomStatus.VACANT }
  ],
  guests: [],
  bookings: [],
  checkInRecords: [],
  expenses: [],
  // Fix: Removed 'transactions' as it is not defined in AppState interface
  settings: DEFAULT_SETTINGS,
  currentUser: null
};

export const loadData = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return INITIAL_STATE;
  try {
    const parsed = JSON.parse(stored);
    return { 
      ...INITIAL_STATE, 
      ...parsed, 
      users: (parsed.users !== undefined && Array.isArray(parsed.users)) ? parsed.users : INITIAL_STATE.users,
      rooms: (parsed.rooms !== undefined && Array.isArray(parsed.rooms)) ? parsed.rooms : INITIAL_STATE.rooms,
      expenses: parsed.expenses || [],
      // Fix: Removed 'transactions' assignment as it is not defined in AppState interface
      checkInRecords: parsed.checkInRecords || [],
      currentUser: null 
    };
  } catch (e) {
    console.error("Critical: Rehydration failed. Ledger might be corrupted.", e);
    return INITIAL_STATE;
  }
};

export const saveData = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Critical: Persistence failed. Check disk space/permissions.", e);
  }
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
