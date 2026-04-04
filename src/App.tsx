// TODO: refine this logic later

import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, 
  DoorOpen, 
  CalendarCheck, 
  Users, 
  Settings as SettingsIcon, 
  LogOut, 
  CreditCard, 
  Menu, 
  X,
  Plus,
  Trash2,
  Printer,
  ChevronRight,
  User as UserIcon,
  Search,
  CheckCircle,
  Clock,
  Home,
  FileText,
  Edit2,
  Upload,
  Image as ImageIcon,
  Download,
  Wallet,
  ShieldCheck,
  Lock,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  IndianRupee,
  Smartphone,
  Banknote,
  AlertCircle
} from 'lucide-react';
import { loadData, saveData, formatCurrency, generateId } from './store';
import { AppState, UserRole, RoomStatus, User, Room, Guest, Booking, CheckInRecord, ExtraCharge, Expense, HotelSettings } from './types';

// Declare html2pdf for TypeScript
declare var html2pdf: any;

// --- Sub-components ---

const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${colorClass}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const Sidebar = ({ currentUser, onLogout, isOpen, toggleMenu }: any) => {
  const location = useLocation();
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/rooms', label: 'Rooms', icon: DoorOpen },
    { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
    { to: '/guests', label: 'Guests History', icon: Users, adminOnly: true },
    { to: '/billing', label: 'Financials', icon: CreditCard, adminOnly: true },
    { to: '/expenses', label: 'Expenses', icon: Wallet, adminOnly: true },
    { to: '/staff', label: 'Housekeeping', icon: Clock },
    { to: '/users', label: 'User Control', icon: ShieldCheck, adminOnly: true },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => toggleMenu(false)}
        />
      )}
      
      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 no-print ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Home className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">InnGuard HMS</h1>
          </div>

          <nav className="flex-1 space-y-1">
            {links.filter(l => !l.adminOnly || isAdmin).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => toggleMenu(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === link.to 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800">
            <div className="flex items-center gap-3 px-4 py-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
                {currentUser?.username.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{currentUser?.fullName}</p>
                <p className="text-xs text-slate-500">{currentUser?.role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

// --- Pages ---

const Dashboard = ({ state }: { state: AppState }) => {
  const isAdmin = state.currentUser?.role === UserRole.ADMIN;
  const revenue = state.checkInRecords.filter(r => r.status === 'COMPLETED').reduce((acc, r) => acc + r.totalPrice, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-500">Real-time property statistics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Rooms" value={state.rooms.length} icon={DoorOpen} colorClass="bg-blue-600" />
        <StatCard title="Cleaning Req." value={state.rooms.filter(r => r.status === RoomStatus.NEEDS_CLEANING).length} icon={Clock} colorClass="bg-orange-500" />
        <StatCard title="Occupied" value={state.rooms.filter(r => r.status === RoomStatus.OCCUPIED).length} icon={CheckCircle} colorClass="bg-indigo-600" />
        <StatCard title="Active Stays" value={state.checkInRecords.filter(r => r.status === 'CHECKED_IN').length} icon={Calendar} colorClass="bg-purple-600" />
      </div>

      {isAdmin && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Revenue Summary</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-gray-500 text-xs font-bold mb-1">TOTAL REALIZED REVENUE</p>
              <p className="text-4xl font-black text-indigo-900">{formatCurrency(revenue)}</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-2xl">
              <Banknote className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BookingPage = ({ state, setState }: { state: AppState, setState: any }) => {
  const navigate = useNavigate();
  const activeCheckIns = state.checkInRecords.filter(r => r.status === 'CHECKED_IN');

  const handleCheckOut = (recordId: string) => {
    const record = state.checkInRecords.find(r => r.id === recordId);
    if (!record) return;
    const checkIn = new Date(record.actualCheckInTime);
    const checkOut = new Date();
    const diffDays = Math.max(1, Math.ceil(Math.abs(checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    const room = state.rooms.find(r => r.id === record.roomId);
    if (!room) return;
    const finalTotal = (diffDays * room.basePrice) + record.extraCharges.reduce((acc, c) => acc + (c.amount * c.quantity), 0);
    
    const newState = { 
      ...state, 
      rooms: state.rooms.map(r => r.id === record.roomId ? { ...r, status: RoomStatus.NEEDS_CLEANING } : r), 
      checkInRecords: state.checkInRecords.map(r => r.id === recordId ? { ...r, actualCheckOutTime: checkOut.toISOString(), status: 'COMPLETED' as any, totalPrice: finalTotal } : r) 
    };
    setState(newState); saveData(newState); navigate(`/invoice/${recordId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Current Occupancy</h2>
        <Link to="/checkin" className="bg-indigo-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg hover:bg-indigo-700 transition-all">
           <Plus className="w-5 h-5" /> New Check-In
        </Link>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-black uppercase tracking-widest text-gray-400 border-b">
            <tr><th className="px-6 py-5">Room</th><th className="px-6 py-5">Guest</th><th className="px-6 py-5">Check-In Time</th><th className="px-6 py-5 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {activeCheckIns.map(record => {
              const guest = state.guests.find(g => g.id === record.guestId);
              const room = state.rooms.find(r => r.id === record.roomId);
              return (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5 font-black text-indigo-600">#{room?.number}</td>
                  <td className="px-6 py-5 font-bold text-gray-800">{guest?.name}</td>
                  <td className="px-6 py-5 text-sm text-gray-500">{new Date(record.actualCheckInTime).toLocaleString()}</td>
                  <td className="px-6 py-5 text-right flex justify-end gap-2">
                    <button onClick={() => navigate(`/checkout-edit/${record.id}`)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold transition-all">Billing</button>
                    <button onClick={() => handleCheckOut(record.id)} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-rose-700">Check-Out</button>
                  </td>
                </tr>
              );
            })}
            {activeCheckIns.length === 0 && <tr><td colSpan={4} className="px-6 py-20 text-center text-gray-400 italic">No active guests found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RoomsPage = ({ state, setState }: { state: AppState, setState: any }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ number: '', type: 'Standard', bedCount: 1, basePrice: 1000, status: RoomStatus.VACANT });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const room: Room = { id: generateId(), ...formData };
    const newState = { ...state, rooms: [...state.rooms, room] };
    setState(newState); saveData(newState);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Room Management</h2>
        <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg">
          <Plus className="w-5 h-5" /> Add Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {state.rooms.map(room => (
          <div key={room.id} className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <h3 className="text-2xl font-black text-slate-900">#{room.number}</h3>
              <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${room.status === RoomStatus.VACANT ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
                {room.status}
              </div>
            </div>
            <p className="text-sm text-gray-500 font-medium">{room.type} • {room.bedCount} Bed(s)</p>
            <div className="mt-auto pt-4 border-t flex justify-between items-center">
               <span className="text-xs text-gray-400 font-bold uppercase">Daily Rate</span>
               <span className="font-black text-indigo-600">{formatCurrency(room.basePrice)}</span>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in duration-300">
            <div className="p-8 border-b flex justify-between items-center">
               <h3 className="text-xl font-bold">Add Room</h3>
               <button type="button" onClick={() => setIsAdding(false)}><X className="text-gray-400" /></button>
            </div>
            <div className="p-8 space-y-4">
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Number</label><input required value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="w-full border rounded-xl px-4 py-3 bg-slate-50" /></div>
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Type</label><input required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border rounded-xl px-4 py-3 bg-slate-50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Beds</label><input type="number" required value={formData.bedCount} onChange={e => setFormData({...formData, bedCount: parseInt(e.target.value)})} className="w-full border rounded-xl px-4 py-3 bg-slate-50" /></div>
                <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Price (₹)</label><input type="number" required value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: parseInt(e.target.value)})} className="w-full border rounded-xl px-4 py-3 bg-slate-50" /></div>
              </div>
            </div>
            <div className="p-8 bg-gray-50 rounded-b-3xl flex gap-4">
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 px-4 py-3 border rounded-xl font-bold text-gray-400">Cancel</button>
              <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const CheckInPage = ({ state, setState }: { state: AppState, setState: any }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ roomId: '', guestName: '', guestPhone: '', guestAddress: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const guestId = generateId();
    const guest: Guest = { id: guestId, name: formData.guestName, phone: formData.guestPhone, address: formData.guestAddress };
    const recordId = generateId();
    const record: CheckInRecord = {
      id: recordId,
      roomId: formData.roomId,
      guestId: guestId,
      checkInDate: new Date().toISOString(),
      checkOutDate: '',
      status: 'CHECKED_IN',
      actualCheckInTime: new Date().toISOString(),
      extraCharges: [],
      totalPrice: 0
    };
    const newState = {
      ...state,
      guests: [...state.guests, guest],
      checkInRecords: [...state.checkInRecords, record],
      rooms: state.rooms.map(r => r.id === formData.roomId ? { ...r, status: RoomStatus.OCCUPIED } : r)
    };
    setState(newState); saveData(newState); navigate('/bookings');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold">New Check-In</h2>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Available Room</label>
          <select required value={formData.roomId} onChange={e => setFormData({...formData, roomId: e.target.value})} className="w-full border rounded-xl px-4 py-3 font-bold bg-slate-50">
            <option value="">Select Room</option>
            {state.rooms.filter(r => r.status === RoomStatus.VACANT).map(r => (
              <option key={r.id} value={r.id}>{r.number} - {r.type} ({formatCurrency(r.basePrice)}/day)</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Guest Name</label><input required value={formData.guestName} onChange={e => setFormData({...formData, guestName: e.target.value})} className="w-full border rounded-xl px-4 py-3 bg-slate-50" /></div>
          <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone</label><input required value={formData.guestPhone} onChange={e => setFormData({...formData, guestPhone: e.target.value})} className="w-full border rounded-xl px-4 py-3 bg-slate-50" /></div>
        </div>
        <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Address</label><textarea required value={formData.guestAddress} onChange={e => setFormData({...formData, guestAddress: e.target.value})} className="w-full border rounded-xl px-4 py-3 bg-slate-50 h-24" /></div>
        <div className="pt-4 flex gap-4">
          <button type="button" onClick={() => navigate('/bookings')} className="flex-1 py-4 border rounded-2xl font-bold text-gray-400">Cancel</button>
          <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg">Check In Now</button>
        </div>
      </form>
    </div>
  );
};

const CheckoutEditPage = ({ state, setState }: { state: AppState, setState: any }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const record = state.checkInRecords.find(r => r.id === id);
  const [newCharge, setNewCharge] = useState({ description: '', amount: 0, quantity: 1 });

  if (!record) return <div className="p-20 text-center font-bold">Record not found.</div>;

  const addCharge = (e: React.FormEvent) => {
    e.preventDefault();
    const charge: ExtraCharge = { id: generateId(), ...newCharge, date: new Date().toISOString() };
    const newState = { ...state, checkInRecords: state.checkInRecords.map(r => r.id === record.id ? { ...r, extraCharges: [...r.extraCharges, charge] } : r) };
    setState(newState); saveData(newState);
    setNewCharge({ description: '', amount: 0, quantity: 1 });
  };

  const removeCharge = (chargeId: string) => {
    const newState = { ...state, checkInRecords: state.checkInRecords.map(r => r.id === record.id ? { ...r, extraCharges: r.extraCharges.filter(c => c.id !== chargeId) } : r) };
    setState(newState); saveData(newState);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold">Billing Details: {state.guests.find(g => g.id === record.guestId)?.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={addCharge} className="bg-white p-6 rounded-3xl border shadow-sm space-y-4 h-fit">
          <h3 className="text-xs font-black uppercase text-gray-400 border-b pb-2">Add Item</h3>
          <div><label className="block text-xs font-bold text-gray-400 mb-1">Description</label><input required value={newCharge.description} onChange={e => setNewCharge({...newCharge, description: e.target.value})} className="w-full border rounded-xl px-4 py-2 bg-slate-50" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-gray-400 mb-1">Rate</label><input type="number" required value={newCharge.amount} onChange={e => setNewCharge({...newCharge, amount: parseInt(e.target.value)})} className="w-full border rounded-xl px-4 py-2 bg-slate-50" /></div>
            <div><label className="block text-xs font-bold text-gray-400 mb-1">Qty</label><input type="number" required value={newCharge.quantity} onChange={e => setNewCharge({...newCharge, quantity: parseInt(e.target.value)})} className="w-full border rounded-xl px-4 py-2 bg-slate-50" /></div>
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md">Add to Bill</button>
        </form>
        <div className="md:col-span-2 bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-4 bg-slate-50 border-b font-bold text-xs text-gray-400 uppercase">Extra Charges List</div>
          <div className="flex-1 divide-y">
            {record.extraCharges.map(charge => (
              <div key={charge.id} className="p-4 flex justify-between items-center group">
                <div>
                  <div className="font-bold text-gray-800">{charge.description}</div>
                  <div className="text-[10px] text-gray-400">{charge.quantity} x {formatCurrency(charge.amount)}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-black text-gray-900">{formatCurrency(charge.amount * charge.quantity)}</div>
                  <button onClick={() => removeCharge(charge.id)} className="text-gray-200 hover:text-rose-600 p-1 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-indigo-50 border-t flex justify-between items-center"><span className="font-bold text-indigo-900 uppercase text-xs">Extras Total</span><span className="text-2xl font-black text-indigo-600">{formatCurrency(record.extraCharges.reduce((acc, c) => acc + (c.amount * c.quantity), 0))}</span></div>
          <div className="p-6 bg-white border-t flex justify-end"><button onClick={() => navigate('/bookings')} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-md">Back to Manifest</button></div>
        </div>
      </div>
    </div>
  );
};

const InvoicePage = ({ state }: { state: AppState }) => {
  const { id } = useParams<{ id: string }>();
  const record = state.checkInRecords.find(r => r.id === id);
  const guest = state.guests.find(g => g.id === record?.guestId);
  const room = state.rooms.find(r => r.id === record?.roomId);
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!record || !guest || !room) return <div className="p-20 text-center font-bold">Incomplete record.</div>;

  const checkIn = new Date(record.actualCheckInTime);
  const checkOut = record.actualCheckOutTime ? new Date(record.actualCheckOutTime) : new Date();
  const diffDays = Math.max(1, Math.ceil(Math.abs(checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
  
  const roomTotal = diffDays * room.basePrice;
  const extrasTotal = record.extraCharges.reduce((acc, c) => acc + (c.amount * c.quantity), 0);
  const subTotal = roomTotal + extrasTotal;
  const gstRate = 0.12; 
  const gstAmount = subTotal * gstRate;
  const grandTotal = subTotal + gstAmount;

  const handlePrint = () => {
    const element = invoiceRef.current;
    if (!element) return;
    const opt = {
      margin: 0.5,
      filename: `Invoice_${record.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center no-print">
         <h2 className="text-xl font-bold">Invoice Generated</h2>
         <div className="flex gap-2">
            <button onClick={() => window.print()} className="bg-white border px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-gray-50"><Printer className="w-4 h-4" /> Print</button>
            <button onClick={handlePrint} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-indigo-700 shadow-md"><Download className="w-4 h-4" /> Save PDF</button>
         </div>
      </div>

      <div ref={invoiceRef} className="bg-white p-12 rounded-3xl border shadow-xl relative invoice-container">
        <div className="flex justify-between items-start mb-12 border-b pb-8">
          <div>
            {state.settings.logoUrl && <img src={state.settings.logoUrl} className="h-12 w-auto mb-4" />}
            <h1 className="text-3xl font-black text-indigo-600">{state.settings.name}</h1>
            <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-widest">{state.settings.address}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Invoice #</p>
            <p className="text-xl font-black">{record.id.toUpperCase()}</p>
            <p className="text-xs font-black text-gray-300 uppercase tracking-widest mt-4">Date</p>
            <p className="font-bold">{new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest mb-2">Guest</h3>
            <p className="text-xl font-bold">{guest.name}</p>
            <p className="text-gray-500 font-medium text-sm">{guest.phone}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl grid grid-cols-2 gap-4">
            <div><p className="text-[10px] font-bold text-gray-400 uppercase">Unit</p><p className="font-black">#{room.number}</p></div>
            <div><p className="text-[10px] font-bold text-gray-400 uppercase">Stay</p><p className="font-black">{diffDays} Night(s)</p></div>
          </div>
        </div>

        <table className="w-full mb-12">
          <thead>
            <tr className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2 text-left">
              <th className="pb-4">Description</th>
              <th className="pb-4 text-center">Rate</th>
              <th className="pb-4 text-center">Qty</th>
              <th className="pb-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="py-4">Room Rental ({room.type})</td>
              <td className="py-4 text-center">{formatCurrency(room.basePrice)}</td>
              <td className="py-4 text-center">{diffDays}</td>
              <td className="py-4 text-right font-bold">{formatCurrency(roomTotal)}</td>
            </tr>
            {record.extraCharges.map(charge => (
              <tr key={charge.id}>
                <td className="py-4">{charge.description}</td>
                <td className="py-4 text-center">{formatCurrency(charge.amount)}</td>
                <td className="py-4 text-center">{charge.quantity}</td>
                <td className="py-4 text-right font-bold">{formatCurrency(charge.amount * charge.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end border-t pt-4">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between items-center text-sm font-bold text-gray-500"><span>Subtotal</span><span>{formatCurrency(subTotal)}</span></div>
            <div className="flex justify-between items-center text-sm font-bold text-gray-500"><span>GST (12%)</span><span>{formatCurrency(gstAmount)}</span></div>
            <div className="flex justify-between items-center pt-2 border-t text-xl font-black text-indigo-600"><span>TOTAL</span><span>{formatCurrency(grandTotal)}</span></div>
          </div>
        </div>

        <div className="mt-20 text-center border-t pt-8">
           <p className="text-gray-400 text-xs italic">"{state.settings.invoiceFooter}"</p>
           <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-8">This is a computer generated invoice.</p>
        </div>
      </div>
    </div>
  );
};

const StaffPage = ({ state, setState }: { state: AppState, setState: any }) => {
  const dirtyRooms = state.rooms.filter(r => r.status === RoomStatus.NEEDS_CLEANING);
  const markClean = (id: string) => {
    const newState = { ...state, rooms: state.rooms.map(r => r.id === id ? { ...r, status: RoomStatus.VACANT } : r) };
    setState(newState); saveData(newState);
  };
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Housekeeping</h2>
      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-black uppercase text-gray-400 border-b"><tr><th className="px-6 py-5">Room Number</th><th className="px-6 py-5">Status</th><th className="px-6 py-5 text-right">Actions</th></tr></thead>
          <tbody className="divide-y">
            {dirtyRooms.map(room => (
              <tr key={room.id}>
                <td className="px-6 py-5 font-bold">ROOM {room.number}</td>
                <td className="px-6 py-5"><span className="bg-orange-100 text-orange-700 px-3 py-1 rounded text-xs font-bold">Needs Service</span></td>
                <td className="px-6 py-5 text-right"><button onClick={() => markClean(room.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700">Mark Clean</button></td>
              </tr>
            ))}
            {dirtyRooms.length === 0 && <tr><td colSpan={3} className="px-6 py-20 text-center text-gray-400 italic">All rooms are serviced.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const GuestHistoryPage = ({ state }: { state: AppState }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Guest Registry</h2>
    <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-xs font-black uppercase text-gray-400 border-b"><tr><th className="px-6 py-5">Name</th><th className="px-6 py-5">Phone</th><th className="px-6 py-5">Address</th><th className="px-6 py-5 text-right">Visits</th></tr></thead>
        <tbody className="divide-y">
          {state.guests.map(guest => (
            <tr key={guest.id}>
              <td className="px-6 py-5 font-bold">{guest.name}</td>
              <td className="px-6 py-5 text-sm">{guest.phone}</td>
              <td className="px-6 py-5 text-sm text-gray-400 truncate max-w-xs">{guest.address}</td>
              <td className="px-6 py-5 text-right font-black text-indigo-600">{state.checkInRecords.filter(r => r.guestId === guest.id).length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const FinancialsPage = ({ state }: { state: AppState }) => {
  const revenue = state.checkInRecords.filter(r => r.status === 'COMPLETED').reduce((acc, r) => acc + r.totalPrice, 0);
  const expenses = state.expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold">Financial Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-10 rounded-3xl border shadow-sm border-l-8 border-l-green-500">
           <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Realized Revenue</p>
           <p className="text-4xl font-black text-green-600">{formatCurrency(revenue)}</p>
        </div>
        <div className="bg-white p-10 rounded-3xl border shadow-sm border-l-8 border-l-rose-500">
           <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Total Expenses</p>
           <p className="text-4xl font-black text-rose-600">{formatCurrency(expenses)}</p>
        </div>
      </div>
    </div>
  );
};

const ExpensesPage = ({ state, setState }: { state: AppState, setState: any }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ category: 'Other', description: '', amount: 0, date: new Date().toISOString().split('T')[0] });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const expense: Expense = { id: generateId(), ...formData };
    const newState = { ...state, expenses: [...state.expenses, expense] };
    setState(newState); saveData(newState);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Expense Registry</h2>
        <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg">
          <Plus className="w-5 h-5" /> Add Expense
        </button>
      </div>
      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-black uppercase text-gray-400 border-b"><tr><th className="px-6 py-5">Date</th><th className="px-6 py-5">Description</th><th className="px-6 py-5">Amount</th></tr></thead>
          <tbody className="divide-y">
            {state.expenses.map(exp => (
              <tr key={exp.id}>
                <td className="px-6 py-5 text-sm">{new Date(exp.date).toLocaleDateString()}</td>
                <td className="px-6 py-5 font-bold">{exp.description}</td>
                <td className="px-6 py-5 font-black text-rose-600">{formatCurrency(exp.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <h3 className="text-xl font-bold mb-6">Log Expense</h3>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label><input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded-xl px-4 py-2" /></div>
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Amount (₹)</label><input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: parseInt(e.target.value)})} className="w-full border rounded-xl px-4 py-2" /></div>
            </div>
            <div className="mt-8 flex gap-4">
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 border rounded-xl font-bold text-gray-400">Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md">Record</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const UsersPage = ({ state, setState }: { state: AppState, setState: any }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Control</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.users.map(user => (
          <div key={user.id} className="bg-white p-8 rounded-3xl border shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-2xl">{user.fullName.charAt(0)}</div>
            <div>
              <h3 className="font-bold text-lg">{user.fullName}</h3>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">{user.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsPage = ({ state, setState }: { state: AppState, setState: any }) => {
  const [formData, setFormData] = useState<HotelSettings>(state.settings);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); const newState = { ...state, settings: formData };
    setState(newState); saveData(newState); alert('Settings updated.');
  };
  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">Hotel Settings</h2>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
        <div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Hotel Name</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-xl px-4 py-3 bg-slate-50 font-bold" /></div>
        <div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Address</label><textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border rounded-xl px-4 py-3 bg-slate-50 h-24" /></div>
        <div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Phone</label><input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border rounded-xl px-4 py-3 bg-slate-50" /></div>
        <div className="pt-4"><button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all">Save Enterprise Details</button></div>
      </form>
    </div>
  );
};

const LoginPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const data = loadData();
    const user = data.users.find(u => u.username === username && u.passwordHash === password);
    if (user) { onLogin(user); } else { setError('Authentication failed.'); }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-12">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white"><Lock className="w-10 h-10" /></div>
          <h1 className="text-3xl font-black">InnGuard Login</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold text-center">{error}</div>}
          <div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Username</label><input required value={username} onChange={e => setUsername(e.target.value)} className="w-full border rounded-xl px-6 py-4 bg-slate-50" /></div>
          <div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Password</label><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded-xl px-6 py-4 bg-slate-50" /></div>
          <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all">SIGN IN</button>
        </form>
      </div>
    </div>
  );
};

const App = () => {
  const [state, setState] = useState<AppState>(() => loadData());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (currentUser) { setState(prev => ({ ...prev, currentUser })); }
  }, [currentUser]);

  if (!currentUser) return <LoginPage onLogin={setCurrentUser} />;

  const isAdmin = currentUser.role === UserRole.ADMIN;

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50 text-slate-900">
        <Sidebar currentUser={currentUser} onLogout={() => setCurrentUser(null)} isOpen={isSidebarOpen} toggleMenu={setIsSidebarOpen} />
        <main className="flex-1 lg:ml-64 flex flex-col">
          <header className="no-print h-20 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2"><Menu /></button>
            <h1 className="font-black text-indigo-600 uppercase text-2xl tracking-tighter">{state.settings.name}</h1>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
          </header>
          <div className="p-8 lg:p-12 flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard state={state} />} />
              <Route path="/rooms" element={<RoomsPage state={state} setState={setState} />} />
              <Route path="/bookings" element={<BookingPage state={state} setState={setState} />} />
              <Route path="/checkin" element={<CheckInPage state={state} setState={setState} />} />
              <Route path="/checkout-edit/:id" element={<CheckoutEditPage state={state} setState={setState} />} />
              <Route path="/invoice/:id" element={<InvoicePage state={state} />} />
              <Route path="/staff" element={<StaffPage state={state} setState={setState} />} />
              <Route path="/guests" element={isAdmin ? <GuestHistoryPage state={state} /> : <Navigate to="/" />} />
              <Route path="/billing" element={isAdmin ? <FinancialsPage state={state} /> : <Navigate to="/" />} />
              <Route path="/expenses" element={isAdmin ? <ExpensesPage state={state} setState={setState} /> : <Navigate to="/" />} />
              <Route path="/users" element={isAdmin ? <UsersPage state={state} setState={setState} /> : <Navigate to="/" />} />
              <Route path="/settings" element={<SettingsPage state={state} setState={setState} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
