import React, { useState, useMemo } from 'react';
import {
  Scissors,
  Calendar,
  Users,
  Award,
  DollarSign,
  Clock,
  Plus,
  Trash2,
  Check,
  X,
  Send,
  Bell,
  Percent,
  Star,
  LogOut,
  Filter,
  PlusCircle,
  TrendingUp,
  Sliders,
  Sparkles
} from 'lucide-react';
import { User, Appointment, Barber, Review, ServiceItem, ServiceCategory, Promotion } from '../types';
import { useT } from '../i18n';
import { formatPrice } from '../utils/format';
import SettingsToggle from './SettingsToggle';

interface AdminAppProps {
  currentUser: User;
  onLogout: () => void;
  appointments: Appointment[];
  barbers: Barber[];
  users: User[];
  reviews: Review[];
  onConfirmAppointment: (id: string) => void;
  onCompleteAppointment: (id: string) => void;
  onCancelAppointment: (id: string) => void;
  onSendCustomNotification: (clientId: string, title: string, message: string) => void;
  onUpdateClientPoints: (userId: string, pointsDelta: number) => void;
  onAddBarber: (newBarber: Barber) => void;
  onRemoveBarber: (id: string) => void;
  services: ServiceItem[];
  onAddService: (newService: ServiceItem) => void;
  onRemoveService: (id: string) => void;
  categories: ServiceCategory[];
  onAddCategory: (newCategory: ServiceCategory) => void;
  onRemoveCategory: (id: string) => void;
  pointValue: number;
  onUpdatePointValue: (val: number) => void;
  promotions: Promotion[];
  onAddPromotion: (newPromo: Promotion) => void;
  onRemovePromotion: (id: string) => void;
}

export default function AdminApp({
  currentUser,
  onLogout,
  appointments,
  barbers,
  users,
  reviews,
  onConfirmAppointment,
  onCompleteAppointment,
  onCancelAppointment,
  onSendCustomNotification,
  onUpdateClientPoints,
  onAddBarber,
  onRemoveBarber,
  services,
  onAddService,
  onRemoveService,
  categories,
  onAddCategory,
  onRemoveCategory,
  pointValue,
  onUpdatePointValue,
  promotions,
  onAddPromotion,
  onRemovePromotion
}: AdminAppProps) {
  const t = useT();
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'barbers' | 'services' | 'customers' | 'promotions'>('dashboard');

  // Filter/Search States
  const [appFilter, setAppFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [customerSearch, setCustomerSearch] = useState('');

  // Closed Sales Ledger States
  const [salesBarberFilter, setSalesBarberFilter] = useState<string>('all');
  const [salesCategoryFilter, setSalesCategoryFilter] = useState<string>('all');
  const [salesPeriodFilter, setSalesPeriodFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [salesSearchQuery, setSalesSearchQuery] = useState<string>('');
  const [salesSortOrder, setSalesSortOrder] = useState<'newest' | 'oldest' | 'price-desc' | 'price-asc'>('newest');

  // Service Config State
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState(categories[0]?.id || '');
  const [newServicePoints, setNewServicePoints] = useState('15');
  const [newServicePointsCost, setNewServicePointsCost] = useState('150');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // Barber Config State
  const [newBarberName, setNewBarberName] = useState('');
  const [newBarberSpecialty, setNewBarberSpecialty] = useState('');
  const [newBarberBio, setNewBarberBio] = useState('');
  const [newBarberAvatar, setNewBarberAvatar] = useState('');
  const [newBarberTimes, setNewBarberTimes] = useState<string[]>(['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM']);

  // Custom Push Alert Modal / Form States
  const [selectedClientForNotif, setSelectedClientForNotif] = useState<string | null>(null);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');

  // Points Adjustment Form States
  const [pointsAdjustmentUser, setPointsAdjustmentUser] = useState<string | null>(null);
  const [pointsDeltaValue, setPointsDeltaValue] = useState<string>('20');

  // Promotion Form States
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('20%');
  const [promoLimit, setPromoLimit] = useState('100');

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // METRICS COMPUTATIONS
  const metrics = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'completed');
    const revenue = completed.reduce((sum, a) => sum + a.price, 0);
    const activeClients = users.filter(u => u.role === 'client').length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    
    // Rating calculation
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

    return { total, revenue, activeClients, pending, avgRating };
  }, [appointments, users, reviews]);

  // Computed Completed Sales list and stats for the new interactive sales panel
  const { filteredSalesList, filteredSalesRevenue, avgTicketValue, topPerformingBarber } = useMemo(() => {
    let list = appointments.filter(a => a.status === 'completed');

    if (salesBarberFilter !== 'all') {
      list = list.filter(a => a.barberName === salesBarberFilter);
    }

    if (salesCategoryFilter !== 'all') {
      list = list.filter(a => a.service.category === salesCategoryFilter);
    }

    if (salesPeriodFilter !== 'all') {
      const nowStr = '2026-07-16';
      const nowDate = new Date(nowStr);
      list = list.filter(a => {
        const itemDate = new Date(a.date);
        if (isNaN(itemDate.getTime())) return true;
        
        const diffMs = nowDate.getTime() - itemDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (salesPeriodFilter === 'today') {
          return a.date === nowStr;
        } else if (salesPeriodFilter === 'week') {
          return diffDays >= 0 && diffDays <= 7;
        } else if (salesPeriodFilter === 'month') {
          return diffDays >= 0 && diffDays <= 30;
        }
        return true;
      });
    }

    if (salesSearchQuery.trim()) {
      const q = salesSearchQuery.toLowerCase();
      list = list.filter(a => 
        a.clientName.toLowerCase().includes(q) || 
        a.clientEmail.toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) => {
      if (salesSortOrder === 'newest') {
        return b.date.localeCompare(a.date) || b.time.localeCompare(a.time);
      } else if (salesSortOrder === 'oldest') {
        return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
      } else if (salesSortOrder === 'price-desc') {
        return b.price - a.price;
      } else if (salesSortOrder === 'price-asc') {
        return a.price - b.price;
      }
      return 0;
    });

    const revenue = list.reduce((sum, a) => sum + a.price, 0);
    const avgTicket = list.length > 0 ? revenue / list.length : 0;

    const barberCounts: Record<string, number> = {};
    list.forEach(a => {
      barberCounts[a.barberName] = (barberCounts[a.barberName] || 0) + a.price;
    });

    let topBarber = t('None');
    let maxSales = -1;
    Object.entries(barberCounts).forEach(([name, sales]) => {
      if (sales > maxSales) {
        maxSales = sales;
        topBarber = `${name} (${formatPrice(sales)})`;
      }
    });

    return {
      filteredSalesList: list,
      filteredSalesRevenue: revenue,
      avgTicketValue: avgTicket,
      topPerformingBarber: topBarber
    };
  }, [appointments, salesBarberFilter, salesCategoryFilter, salesPeriodFilter, salesSearchQuery, salesSortOrder]);

  // Handle Form Submissions
  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice || !newServiceDuration) return;

    onAddService({
      id: 's_' + Math.floor(Math.random() * 100000),
      name: newServiceName,
      price: parseFloat(newServicePrice),
      duration: parseInt(newServiceDuration),
      pointsGiven: parseInt(newServicePoints) || 15,
      pointsCost: parseInt(newServicePointsCost) || 150,
      description: newServiceDesc,
      category: newServiceCategory || categories[0]?.id || 'Haircuts'
    });

    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDuration('');
    setNewServiceDesc('');
  };

  const handleCreateBarber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarberName) return;

    onAddBarber({
      id: 'b_' + Math.floor(Math.random() * 100000),
      name: newBarberName,
      specialty: newBarberSpecialty || 'Styling',
      rating: 5.0,
      reviewsCount: 0,
      avatar: newBarberAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      bio: newBarberBio || 'Master Stylist and Grooming Artisan.',
      availableTimes: newBarberTimes
    });

    setNewBarberName('');
    setNewBarberSpecialty('');
    setNewBarberBio('');
    setNewBarberAvatar('');
  };

  const handleCreatePromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle || !promoDiscount) return;

    onAddPromotion({
      id: 'p_' + Math.floor(Math.random() * 100000),
      title: promoTitle,
      description: promoDesc,
      discount: promoDiscount,
      image: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&q=80&w=300',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bookingLimit: parseInt(promoLimit) || 100,
      bookingsCount: 0
    });

    setPromoTitle('');
    setPromoDesc('');
    setPromoDiscount('');
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    onAddCategory({
      id: 'cat_' + Math.floor(Math.random() * 100000),
      name: newCatName,
      description: newCatDesc || 'Salon operations',
      bgClass: 'bg-amber-500/10',
      fillClass: 'text-amber-500',
      textClass: 'text-amber-400'
    });

    setNewCatName('');
    setNewCatDesc('');
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForNotif || !notifTitle || !notifMessage) return;

    onSendCustomNotification(selectedClientForNotif, notifTitle, notifMessage);
    setSelectedClientForNotif(null);
    setNotifTitle('');
    setNotifMessage('');
  };

  const handleAdjustPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pointsAdjustmentUser || !pointsDeltaValue) return;

    onUpdateClientPoints(pointsAdjustmentUser, parseInt(pointsDeltaValue));
    setPointsAdjustmentUser(null);
    setPointsDeltaValue('20');
  };

  const filteredAppointments = appointments.filter(a => {
    if (appFilter === 'all') return true;
    return a.status === appFilter;
  });

  const filteredClients = users.filter(u => {
    if (u.role !== 'client') return false;
    return u.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
           u.email.toLowerCase().includes(customerSearch.toLowerCase());
  });

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#07090f] text-slate-150 font-sans antialiased overflow-hidden">
      
      {/* 1. SIDEBAR DECK */}
      <aside className="w-full md:w-72 bg-[#0a0d16] border-r border-slate-850 flex flex-col shrink-0">
        
        {/* Salon Branding Header */}
        <div className="p-6 border-b border-slate-850 flex items-center gap-3">
          <div className="h-10 w-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 shadow-inner">
            <Scissors className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase text-slate-100 font-sans">
              {t('Barberhouse')}
            </h1>
            <p className="text-[10px] text-amber-500 font-mono tracking-widest uppercase font-bold">
              {t('Admin Console')}
            </p>
          </div>
        </div>

        {/* Navigation Actions */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border-none cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 bg-transparent'
            }`}
          >
            <TrendingUp className="h-4.5 w-4.5 text-amber-500" />
            {t('Performance Desk')}
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border-none cursor-pointer whitespace-nowrap ${
              activeTab === 'appointments'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 bg-transparent'
            }`}
          >
            <span className="flex items-center gap-3">
              <Calendar className="h-4.5 w-4.5 text-amber-500" />
              {t('Bookings Queue')}
            </span>
            {metrics.pending > 0 && (
              <span className="h-5 px-1.5 min-w-[20px] rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-mono text-[10px] flex items-center justify-center font-bold">
                {metrics.pending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('barbers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border-none cursor-pointer whitespace-nowrap ${
              activeTab === 'barbers'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 bg-transparent'
            }`}
          >
            <Scissors className="h-4.5 w-4.5 text-amber-500" />
            {t('Staff Roster')}
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border-none cursor-pointer whitespace-nowrap ${
              activeTab === 'services'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 bg-transparent'
            }`}
          >
            <Sliders className="h-4.5 w-4.5 text-amber-500" />
            {t('Service Directory')}
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border-none cursor-pointer whitespace-nowrap ${
              activeTab === 'customers'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 bg-transparent'
            }`}
          >
            <Users className="h-4.5 w-4.5 text-amber-500" />
            {t('Customer Registry')}
          </button>

          <button
            onClick={() => setActiveTab('promotions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border-none cursor-pointer whitespace-nowrap ${
              activeTab === 'promotions'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 bg-transparent'
            }`}
          >
            <Percent className="h-4.5 w-4.5 text-amber-500" />
            {t('Promotional Desk')}
          </button>
        </nav>

        {/* Active Session & Log out */}
        <div className="p-4 border-t border-slate-850 bg-[#080b12]">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-350 overflow-hidden">
              <span className="font-mono text-amber-500">M</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200 font-sans leading-none">{currentUser.name}</p>
              <p className="text-[10px] text-amber-500/90 font-mono mt-0.5 leading-none font-bold">{t('Salon Executive')}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl border border-slate-850 hover:border-red-500/45 hover:bg-red-500/5 text-slate-400 hover:text-red-400 text-xs font-semibold uppercase tracking-wide transition-all bg-transparent cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t('Terminal Logout')}
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKING SPACE CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#07090f] overflow-y-auto">
        
        {/* Top Header info */}
        <header className="h-16 border-b border-slate-850 px-8 flex items-center justify-between bg-[#0a0d16]/30 backdrop-blur shrink-0">
          <div className="flex items-center gap-2">
             <h2 className="text-sm font-black uppercase tracking-widest text-slate-200 font-sans">
               {t(activeTab + ' Portal')}
             </h2>
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          </div>

          {/* Loyalty Exchange Rate Setting Controller */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-850 flex items-center gap-3 text-xs">
              <Award className="h-3.5 w-3.5 text-amber-500" />
               <span className="font-mono text-[10.5px] text-slate-400">
                   {t('1 Point =')} <strong className="text-amber-500">{formatPrice(pointValue)}</strong>
                </span>
              <div className="flex items-center gap-1.5 ml-2 border-l border-slate-850 pl-2">
                <button
                  onClick={() => onUpdatePointValue(Math.max(0.01, pointValue - 0.01))}
                  className="px-1 text-slate-400 hover:text-white bg-slate-900 border-none rounded hover:bg-slate-800 cursor-pointer"
                >
                  -
                </button>
                <button
                  onClick={() => onUpdatePointValue(pointValue + 0.01)}
                  className="px-1 text-slate-400 hover:text-white bg-slate-900 border-none rounded hover:bg-slate-800 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            <SettingsToggle />
          </div>
        </header>

        {/* Tabs Router Content Canvas */}
        <div className="p-8 flex-grow">
          
          {/* A. DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Highlight Banner */}
              <div className="p-6 bg-slate-900/30 border border-slate-850 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 shrink-0">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{t('Welcome to Executive Control,')} {currentUser.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl">
                      {t('Monitor parlor performance meters in real-time, update stylist calendars, alter prices, adjust client loyalty balances, and deploy marketing discount campaigns.')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 py-2 px-4 bg-slate-950 border border-slate-850 rounded-xl font-mono text-xs text-amber-500 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block mr-1" />
                  {t('LIVE METRICS ACTIVE')}
                </div>
              </div>

              {/* Big Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="p-6 rounded-3xl bg-[#090d16] border border-slate-850 shadow-sm relative overflow-hidden group hover:border-amber-500/20 transition-all">
                  <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-15 transition-opacity">
                    <DollarSign className="h-20 w-20 text-amber-500" />
                  </div>
                  <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">{t('Closed Sales')}</p>
                   <p className="text-2xl font-black text-amber-500 mt-2 font-mono">{formatPrice(metrics.revenue)}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/25 px-2 py-1 rounded-lg w-max">
                    <TrendingUp className="h-3 w-3" />
                    {t('+12% this week')}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-[#090d16] border border-slate-850 shadow-sm relative overflow-hidden group hover:border-amber-500/20 transition-all">
                  <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-15 transition-opacity">
                    <Calendar className="h-20 w-20 text-amber-500" />
                  </div>
                  <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">{t('All Bookings')}</p>
                  <p className="text-2xl font-black text-slate-100 mt-2 font-mono">{metrics.total}</p>
                  <div className="mt-4 text-[10px] text-slate-450">
                    <strong className="text-slate-350">{metrics.pending} {t('pending')}</strong> {t('awaiting review')}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-[#090d16] border border-slate-850 shadow-sm relative overflow-hidden group hover:border-amber-500/20 transition-all">
                  <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-15 transition-opacity">
                    <Users className="h-20 w-20 text-amber-500" />
                  </div>
                  <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">{t('Client accounts')}</p>
                  <p className="text-2xl font-black text-slate-100 mt-2 font-mono">{metrics.activeClients}</p>
                  <div className="mt-4 text-[10px] text-slate-450">
                    {t('Unique customer profiles registered')}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-[#090d16] border border-slate-850 shadow-sm relative overflow-hidden group hover:border-amber-500/20 transition-all">
                  <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-15 transition-opacity">
                    <Star className="h-20 w-20 text-amber-500" />
                  </div>
                  <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">{t('Audited Star Rating')}</p>
                  <p className="text-2xl font-black text-amber-500 mt-2 font-mono">{metrics.avgRating} <span className="text-sm font-sans text-slate-550">/ 5.0</span></p>
                  <div className="mt-4 text-[10px] text-slate-450">
                    {t('Calculated from')} <strong className="text-slate-350">{reviews.length} {t('written reviews')}</strong>
                  </div>
                </div>

              </div>

              {/* COMPREHENSIVE CLOSED SALES LEDGER */}
              <div className="p-6 rounded-3xl bg-[#090d16] border border-slate-850 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-amber-500" />
                      {t('Closed Sales & Revenue Analysis')}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {t('Audit completed service logs, calculate barber splits, and filter performance revenue.')}
                    </p>
                  </div>
                  
                  {/* Quick toggle indicator */}
                  <div className="flex gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-850">
                    <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-1 text-slate-400">
                       {t('Total Completed:')} {appointments.filter(a => a.status === 'completed').length}
                     </span>
                  </div>
                </div>

                {/* FILTERS DECK */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-850">
                  
                  {/* 1. Barber Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">
                      {t('Barber / Stylist')}
                    </label>
                    <select
                      value={salesBarberFilter}
                      onChange={e => setSalesBarberFilter(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/40 cursor-pointer"
                    >
                      <option value="all">{t('All Barbers')}</option>
                      {barbers.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Service Category Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">
                      {t('Service Category')}
                    </label>
                    <select
                      value={salesCategoryFilter}
                      onChange={e => setSalesCategoryFilter(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/40 cursor-pointer"
                    >
                      <option value="all">{t('All Categories')}</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Time period Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">
                      {t('Time Frame')}
                    </label>
                    <select
                      value={salesPeriodFilter}
                      onChange={e => setSalesPeriodFilter(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/40 cursor-pointer"
                    >
                      <option value="all">{t('All Time')}</option>
                      <option value="today">{t('Today (Jul 16, 2026)')}</option>
                      <option value="week">{t('This Week (Last 7 Days)')}</option>
                      <option value="month">{t('This Month (Last 30 Days)')}</option>
                    </select>
                  </div>

                  {/* 4. Search Client Query */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">
                      {t('Client Search')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('Name or email...')}
                      value={salesSearchQuery}
                      onChange={e => setSalesSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                    />
                  </div>

                  {/* 5. Sorting Ledger */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">
                      {t('Sort Ledger By')}
                    </label>
                    <select
                      value={salesSortOrder}
                      onChange={e => setSalesSortOrder(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/40 cursor-pointer"
                    >
                      <option value="newest">{t('Newest First')}</option>
                      <option value="oldest">{t('Oldest First')}</option>
                      <option value="price-desc">{t('Highest Revenue')}</option>
                      <option value="price-asc">{t('Lowest Revenue')}</option>
                    </select>
                  </div>

                </div>

                {/* FILTERED KEY METRICS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-amber-500/[0.02] border border-amber-500/5 rounded-2xl">
                  
                  <div className="px-4 py-3 border-r border-slate-850/65 last:border-none">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 block">{t('Filtered Sales Revenue')}</span>
                     <span className="text-xl font-black text-amber-500 font-mono block mt-1">
                       {formatPrice(filteredSalesRevenue)}
                     </span>
                  </div>

                  <div className="px-4 py-3 border-r border-slate-850/65 last:border-none">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 block">{t('Transaction Count')}</span>
                    <span className="text-xl font-black text-slate-200 font-mono block mt-1">
                      {filteredSalesList.length} <span className="text-xs text-slate-500 font-sans font-normal">{t('completed')}</span>
                    </span>
                  </div>

                  <div className="px-4 py-3 border-r border-slate-850/65 last:border-none">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 block">{t('Average Ticket Value')}</span>
                     <span className="text-xl font-black text-slate-200 font-mono block mt-1">
                       {formatPrice(avgTicketValue)}
                     </span>
                  </div>

                  <div className="px-4 py-3 last:border-none">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 block">{t('Top Performing Barber')}</span>
                    <span className="text-sm font-black text-amber-500 block truncate mt-1">
                      {topPerformingBarber}
                    </span>
                  </div>

                </div>

                {/* ACTUAL SALES DATA LIST TABLE */}
                <div className="border border-slate-850 bg-slate-950/20 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-950/70 border-b border-slate-850 text-slate-450 font-mono tracking-wider uppercase">
                          <th className="p-3 pl-5">{t('Client Profile')}</th>
                          <th className="p-3">{t('Serviced By')}</th>
                          <th className="p-3">{t('Service Offered')}</th>
                          <th className="p-3">{t('Category')}</th>
                          <th className="p-3">{t('Execution Date')}</th>
                          <th className="p-3">{t('Point Credits')}</th>
                          <th className="p-3 pr-5 text-right">{t('Invoice Amt')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/65">
                        {filteredSalesList.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-10 text-center text-slate-500 italic">
                              {t('No completed sales matches the selected filters.')}
                            </td>
                          </tr>
                        ) : (
                          filteredSalesList.map(item => (
                            <tr key={item.id} className="hover:bg-slate-900/10 transition-colors">
                              <td className="p-3 pl-5">
                                <p className="font-bold text-slate-300">{item.clientName}</p>
                                <p className="text-[10px] text-slate-500">{item.clientEmail}</p>
                              </td>
                              <td className="p-3 font-semibold text-slate-300">
                                {item.barberName}
                              </td>
                              <td className="p-3">
                                <span className="text-amber-500 font-bold">{item.service.name}</span>
                                <span className="text-[10px] text-slate-550 font-mono ml-2">({item.service.duration} {t('mins')})</span>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-lg bg-slate-950 text-slate-400 border border-slate-850 text-[10px] font-mono">
                                  {item.service.category}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-slate-400">
                                {item.date} <span className="text-slate-600 text-[10px] ml-1">{item.time}</span>
                              </td>
                               <td className="p-3 font-mono text-emerald-400 font-bold">
                                 +{item.service.pointsGiven} {t('PTS')}
                               </td>
                               <td className="p-3 pr-5 text-right font-mono font-black text-amber-500">
                                 {formatPrice(item.price)}
                               </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Grid with recent reviews and appointments summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Recent Feed of Reviews */}
                <div className="p-6 rounded-3xl bg-[#090d16] border border-slate-850 flex flex-col h-[380px]">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    {t('Latest Audited Feedback')}
                  </h4>
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
                    {reviews.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                        <Star className="h-8 w-8 opacity-25 mb-2" />
                        <p className="text-xs">{t('No client reviews filed yet in this ledger.')}</p>
                      </div>
                    ) : (
                      reviews.map(r => {
                        const stylistName = barbers.find(b => b.id === r.barberId)?.name || t('Stylist');
                        return (
                          <div key={r.id} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <p className="text-xs font-bold text-slate-250 leading-none">{r.clientName}</p>
                                <p className="text-[10px] text-slate-500 mt-1">{t('Serviced by:')} <strong className="text-amber-500">{stylistName}</strong></p>
                              </div>
                              <div className="flex items-center gap-0.5 px-2 py-0.5 bg-amber-500/10 rounded-lg text-amber-400 font-bold text-[10px]">
                                <span>{r.rating}</span>
                                <Star className="h-2.5 w-2.5 fill-amber-400 stroke-none" />
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 italic mt-3 leading-relaxed">
                              "{r.comment}"
                            </p>
                            <p className="text-[9px] text-slate-600 font-mono mt-2 text-right">{r.date}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Queue Summary */}
                <div className="p-6 rounded-3xl bg-[#090d16] border border-slate-850 flex flex-col h-[380px]">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-amber-500" />
                      {t('Awaiting Approvals')}
                    </span>
                    <span className="text-[10px] bg-red-900/20 text-red-400 px-2 py-0.5 rounded-lg border border-red-500/20 font-mono">
                      {metrics.pending} {t('Pending')}
                    </span>
                  </h4>
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
                    {appointments.filter(a => a.status === 'pending').length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                        <Check className="h-8 w-8 text-emerald-500 opacity-30 mb-2 animate-pulse" />
                        <p className="text-xs">{t('Perfect! No pending bookings in the queue.')}</p>
                      </div>
                    ) : (
                      appointments.filter(a => a.status === 'pending').map(a => (
                        <div key={a.id} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex justify-between items-center gap-4">
                          <div>
                            <p className="text-xs font-bold text-slate-200 leading-none">{a.clientName}</p>
                             <p className="text-[10px] text-amber-500 mt-1">{a.service.name} • {formatPrice(a.service.price)}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{t('With')} {a.barberName} {t('on')} {a.date} {t('at')} {a.time}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => onConfirmAppointment(a.id)}
                              className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 cursor-pointer"
                              title={t('Approve Booking')}
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onCancelAppointment(a.id)}
                              className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-600 dark:text-red-400 cursor-pointer"
                              title={t('Decline Booking')}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* B. APPOINTMENTS QUEUE TAB */}
          {activeTab === 'appointments' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Queue Controls Filter Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/35 p-4 rounded-2xl border border-slate-850">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-semibold text-slate-350 uppercase">{t('Filter by Status:')}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setAppFilter(f)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-all border-none cursor-pointer whitespace-nowrap ${
                        appFilter === f
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table List of Bookings */}
              <div className="bg-[#090d16] border border-slate-850 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950/50 border-b border-slate-850 text-slate-400 font-mono tracking-wider uppercase">
                         <th className="p-4 pl-6">{t('Client Customer')}</th>
                         <th className="p-4">{t('Requested Service')}</th>
                         <th className="p-4">{t('Barber Stylist')}</th>
                         <th className="p-4">{t('Date / Time')}</th>
                         <th className="p-4">{t('Paid Charge')}</th>
                         <th className="p-4">{t('Booking State')}</th>
                         <th className="p-4 pr-6 text-right">{t('Quick Actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {filteredAppointments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-slate-500">
                            {t('No appointments found with state matching')} "{appFilter}".
                          </td>
                        </tr>
                      ) : (
                        filteredAppointments.map(a => (
                          <tr key={a.id} className="hover:bg-slate-900/20 transition-colors">
                            <td className="p-4 pl-6">
                              <p className="font-bold text-slate-200 font-sans">{a.clientName}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{a.clientEmail}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-semibold text-amber-500">{a.service.name}</p>
                               <p className="text-[10px] text-slate-500 mt-0.5">{a.service.duration} {t('mins duration')}</p>
                            </td>
                            <td className="p-4 font-medium text-slate-300">{a.barberName}</td>
                            <td className="p-4">
                              <p className="font-bold text-slate-200 font-sans">{a.date}</p>
                              <p className="text-[10px] font-mono text-slate-500 mt-0.5">{a.time}</p>
                            </td>
                             <td className="p-4 font-mono font-bold text-slate-300">
                               {formatPrice(a.price)}
                             </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                a.status === 'pending' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                                a.status === 'confirmed' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' :
                                a.status === 'completed' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                                'bg-red-500/10 border border-red-500/20 text-red-400'
                                 }`}>
                                 {t(a.status)}
                               </span>
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {a.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => onConfirmAppointment(a.id)}
                                       className="py-1 px-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold hover:scale-[1.02] active:scale-[0.98] transition-all border-none cursor-pointer"
                                     >
                                       {t('Approve')}
                                     </button>
                                     <button
                                       onClick={() => onCancelAppointment(a.id)}
                                       className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-600 dark:text-red-400 cursor-pointer"
                                       title={t('Cancel Reservation')}
                                    >
                                      <X className="h-4.5 w-4.5" />
                                    </button>
                                  </>
                                )}

                                {a.status === 'confirmed' && (
                                  <>
                                    <button
                                      onClick={() => onCompleteAppointment(a.id)}
                                       className="py-1 px-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold hover:scale-[1.02] active:scale-[0.98] transition-all border-none cursor-pointer"
                                     >
                                       {t('Mark Complete')}
                                     </button>
                                     <button
                                       onClick={() => onCancelAppointment(a.id)}
                                       className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-600 dark:text-red-400 cursor-pointer"
                                       title={t('Decline Reservation')}
                                    >
                                      <X className="h-4.5 w-4.5" />
                                    </button>
                                  </>
                                )}

                                {a.status === 'completed' && (
                                   <span className="text-[10px] text-slate-500 font-mono font-medium">{t('Archived Session')}</span>
                                )}

                                {a.status === 'cancelled' && (
                                   <span className="text-[10px] text-red-500/50 font-mono font-medium">{t('Cancelled')}</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* C. STAFF ROSTER DIRECTORY */}
          {activeTab === 'barbers' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Add New Barber Box */}
              <div className="p-6 rounded-3xl bg-[#090d16] border border-slate-850">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-5 flex items-center gap-2">
                  <PlusCircle className="h-4 w-4 text-amber-500" />
                  {t('Induct New Master Barber')}
                </h3>
                
                <form onSubmit={handleCreateBarber} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">{t('Full Stylist Name')}</label>
                    <input
                      type="text"
                      required
                      placeholder={t('e.g. Jack Pierce')}
                      value={newBarberName}
                      onChange={e => setNewBarberName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">{t('Primary Specialty')}</label>
                    <input
                      type="text"
                      placeholder={t('e.g. Skin Fades & Shaves')}
                      value={newBarberSpecialty}
                      onChange={e => setNewBarberSpecialty(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">{t('Photo Avatar URL')}</label>
                    <input
                      type="text"
                      placeholder={t('Unsplash image URL...')}
                      value={newBarberAvatar}
                      onChange={e => setNewBarberAvatar(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      {t('Add Barber')}
                    </button>
                  </div>

                  <div className="md:col-span-2 space-y-1 mt-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">{t('Short Professional Bio')}</label>
                    <input
                      type="text"
                      placeholder={t('Specialized in hot towel shaves with over 10 years experience...')}
                      value={newBarberBio}
                      onChange={e => setNewBarberBio(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-1 mt-1 justify-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">{t('Weekly Shift Slots')}</span>
                    <div className="flex gap-1.5 mt-1.5">
                      {['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'].map(time => {
                        const isSel = newBarberTimes.includes(time);
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => {
                              if (isSel) {
                                setNewBarberTimes(newBarberTimes.filter(t => t !== time));
                              } else {
                                setNewBarberTimes([...newBarberTimes, time]);
                              }
                            }}
                            className={`px-2 py-1.5 rounded-lg font-mono text-[9px] font-bold border cursor-pointer transition-all ${
                              isSel 
                                ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-extrabold'
                                : 'bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-700'
                            }`}
                          >
                            {time.split(' ')[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </form>
              </div>

              {/* Grid of Active Barbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {barbers.map(b => (
                  <div key={b.id} className="p-6 rounded-3xl bg-[#090d16] border border-slate-850 flex flex-col relative group">
                    
                    {/* Delete Icon overlay */}
                    <button
                      onClick={() => onRemoveBarber(b.id)}
                      className="absolute top-4 right-4 p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:scale-105 transition-all cursor-pointer opacity-0 group-hover:opacity-100 animate-fadeIn"
                      title={t('Decommission Barber')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-4">
                      <img
                        src={b.avatar}
                        alt={b.name}
                        className="h-14 w-14 rounded-2xl object-cover border border-slate-800"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">{b.name}</h4>
                        <div className="flex items-center gap-1 mt-1 text-xs">
                          <span className="font-mono text-[10px] text-amber-500 font-bold">{b.rating.toFixed(1)}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-2.5 w-2.5 ${
                                  i < Math.floor(b.rating)
                                    ? 'fill-amber-400 stroke-none'
                                    : 'fill-slate-800 stroke-none'
                                }`}
                              />
                            ))}
                          </div>
                           <span className="text-[9px] text-slate-500 font-mono">({b.reviewsCount} {t('reviews')})</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed italic mt-4 mb-4 flex-1">
                      "{b.bio}"
                    </p>

                    <div className="pt-4 border-t border-slate-850/65 space-y-3">
                      <div>
                        <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold">{t('Skills Catalog')}</span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-400 text-[10px]">
                            {b.specialty}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold">{t('Shift Hours Slots')}</span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {b.availableTimes.map(time => (
                            <span key={time} className="px-1.5 py-0.5 rounded-lg bg-amber-500/5 text-amber-500/90 font-mono text-[9px] border border-amber-500/10 font-bold">
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* D. SERVICE DIRECTORY PORTAL */}
          {activeTab === 'services' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Add Service Column */}
                <div className="lg:col-span-2 p-6 rounded-3xl bg-[#090d16] border border-slate-850 h-max">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-5 flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-amber-500" />
                    {t('Register New Service Offering')}
                  </h3>

                  <form onSubmit={handleCreateService} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">{t('Service Name')}</label>
                      <input
                        type="text"
                        required
                        placeholder={t('e.g. Classic Beard Trim')}
                        value={newServiceName}
                        onChange={e => setNewServiceName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">{t('Category Group')}</label>
                      <select
                        value={newServiceCategory}
                        onChange={e => setNewServiceCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/40 cursor-pointer"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">{t('Retail Price ($ USD)')}</label>
                      <input
                        type="number"
                        step="0.50"
                        required
                        placeholder={t('35.00')}
                        value={newServicePrice}
                        onChange={e => setNewServicePrice(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">{t('Duration (minutes)')}</label>
                      <input
                        type="number"
                        required
                        placeholder={t('30')}
                        value={newServiceDuration}
                        onChange={e => setNewServiceDuration(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">{t('Loyalty Points Credited')}</label>
                      <input
                        type="number"
                        required
                        placeholder={t('15')}
                        value={newServicePoints}
                        onChange={e => setNewServicePoints(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">{t('Points Cost to Redeem')}</label>
                      <input
                        type="number"
                        required
                        placeholder={t('150')}
                        value={newServicePointsCost}
                        onChange={e => setNewServicePointsCost(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">{t('Service Description')}</label>
                      <textarea
                        rows={2}
                        placeholder={t('Precision styling with premium hot shave lathers...')}
                        value={newServiceDesc}
                        onChange={e => setNewServiceDesc(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40 resize-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        {t('Create Service Entry')}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Add Category Column */}
                <div className="p-6 rounded-3xl bg-[#090d16] border border-slate-850 h-max">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-5 flex items-center gap-2">
                    <PlusCircle className="h-4 w-4 text-amber-500" />
                    {t('Create Service Category')}
                  </h3>

                  <form onSubmit={handleCreateCategory} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">{t('Category Title')}</label>
                      <input
                        type="text"
                        required
                        placeholder={t('e.g. Coloring')}
                        value={newCatName}
                        onChange={e => setNewCatName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">{t('Category Brief Description')}</label>
                      <input
                        type="text"
                        placeholder={t('Premium beard treatments and lines...')}
                        value={newCatDesc}
                        onChange={e => setNewCatDesc(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl border border-slate-800 hover:border-amber-500/40 text-slate-350 hover:text-amber-400 text-xs font-bold uppercase tracking-wider transition-all bg-transparent cursor-pointer"
                    >
                      {t('Add Category Group')}
                    </button>
                  </form>

                  <div className="mt-6 border-t border-slate-850 pt-5 space-y-2">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold block">{t('Current Directory Categories')}</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {categories.map(c => (
                        <div key={c.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-300">
                          <span>{c.name}</span>
                          <button
                            type="button"
                            onClick={() => onRemoveCategory(c.id)}
                            className="p-0 border-none bg-transparent hover:text-red-400 text-slate-600 cursor-pointer text-[10px] font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Service Cards Listing */}
              <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">{t('Existing Services Menu')}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map(s => (
                    <div key={s.id} className="p-5 rounded-3xl bg-[#090d16] border border-slate-850 flex flex-col justify-between group relative">
                      
                      {/* Trash action */}
                      <button
                        onClick={() => onRemoveService(s.id)}
                        className="absolute top-4 right-4 p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:scale-105 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                        title={t('Delete Offering')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-mono uppercase bg-slate-950 text-slate-450 px-2.5 py-1 rounded-xl border border-slate-850 font-bold">
                            {s.category}
                          </span>
                          <span className="text-xs font-mono font-bold text-amber-500 pr-6">{formatPrice(s.price)}</span>
                        </div>

                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-200 mt-2">{s.name}</h5>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                          {s.description || t('No description cataloged.')}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-850/65 mt-4 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[10px] text-slate-500">
                           <Clock className="h-3 w-3 text-amber-500" />
                           {s.duration} {t('minutes')}
                         </span>
                         <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold font-mono">
                           <Award className="h-3 w-3 text-amber-500" />
                           +{s.pointsGiven} {t('PTS')}
                         </span>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* E. CUSTOMER REGISTRY & LOYALTY MANAGER */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Search inputs */}
              <div className="flex justify-between items-center bg-slate-900/35 p-4 rounded-2xl border border-slate-850">
                <input
                  type="text"
                  placeholder={t('Search clients by name, profile or email...')}
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40 w-full max-w-md"
                />
                  <span className="text-[10px] text-slate-500 font-mono tracking-wider font-bold">
                   {filteredClients.length} {t('Registered Accounts')}
                 </span>
              </div>

              {/* Grid of Client ledgers */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map(c => {
                  const clientBookings = appointments.filter(a => a.clientId === c.id);
                  const completedCount = clientBookings.filter(a => a.status === 'completed').length;
                  
                  return (
                    <div key={c.id} className="p-6 rounded-3xl bg-[#090d16] border border-slate-850 flex flex-col justify-between">
                      
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-850 border border-slate-800 flex items-center justify-center font-bold text-slate-350">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">{c.name}</h4>
                            <p className="text-[10px] text-slate-500 font-mono">{c.email}</p>
                          </div>
                        </div>

                        {/* Customer Ledger Specs */}
                        <div className="mt-5 grid grid-cols-2 gap-3 p-3.5 bg-slate-950/50 rounded-2xl border border-slate-850">
                          <div>
                            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 block">{t('Redeemable PTS')}</span>
                            <span className="text-sm font-black text-amber-500 font-mono mt-1 block">
                              {c.loyaltyPoints} <strong className="text-[10px] text-slate-500 font-sans font-normal">{t('pts')}</strong>
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 block">{t('Completed')}</span>
                            <span className="text-sm font-black text-slate-250 font-mono mt-1 block">
                              {completedCount} <strong className="text-[10px] text-slate-500 font-sans font-normal">{t('vst')}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Manual Ledger Controls */}
                      <div className="pt-4 border-t border-slate-850/65 mt-5 space-y-2.5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setPointsAdjustmentUser(c.id);
                              setPointsDeltaValue('20');
                            }}
                            className="flex-1 py-1.5 px-3.5 rounded-xl border border-slate-800 hover:border-amber-500/30 text-slate-400 hover:text-amber-400 text-[10px] font-bold uppercase transition-all bg-transparent cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Award className="h-3 w-3" />
                            {t('Adjust Points')}
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedClientForNotif(c.id);
                              setNotifTitle(t('Exclusive Offer for You'));
                              setNotifMessage('');
                            }}
                            className="flex-1 py-1.5 px-3.5 rounded-xl border border-slate-800 hover:border-amber-500/30 text-slate-400 hover:text-amber-400 text-[10px] font-bold uppercase transition-all bg-transparent cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Bell className="h-3 w-3" />
                            {t('Push Alert')}
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* POINTS ADJUSTMENT POPUP MODAL */}
              {pointsAdjustmentUser && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4 backdrop-blur-sm">
                  <div className="w-full max-w-sm p-6 rounded-3xl bg-[#090d16] border border-slate-800 shadow-2xl relative">
                    <button
                      onClick={() => setPointsAdjustmentUser(null)}
                      className="absolute top-4 right-4 text-slate-500 hover:text-slate-350 bg-transparent border-none cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-500" />
                      {t('Adjust Loyalty Points Balance')}
                    </h4>
                    
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      {t('Manually add or deduct points for')} <strong className="text-slate-200">{users.find(u => u.id === pointsAdjustmentUser)?.name}</strong>. {t('Input positive to award, or negative to debit.')}
                    </p>

                    <form onSubmit={handleAdjustPoints} className="space-y-4">
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block mb-1">{t('Points Delta Amount')}</label>
                        <input
                          type="number"
                          required
                          value={pointsDeltaValue}
                          onChange={e => setPointsDeltaValue(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40 font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border-none"
                      >
                        {t('Commit Adjustment')}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* CUSTOM NOTIFICATION POPUP MODAL */}
              {selectedClientForNotif && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4 backdrop-blur-sm">
                  <div className="w-full max-w-sm p-6 rounded-3xl bg-[#090d16] border border-slate-800 shadow-2xl relative">
                    <button
                      onClick={() => setSelectedClientForNotif(null)}
                      className="absolute top-4 right-4 text-slate-500 hover:text-slate-350 bg-transparent border-none cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
                      <Bell className="h-4 w-4 text-amber-500" />
                      {t('Dispatch Custom Customer Alert')}
                    </h4>

                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      {t("Send a tailored banner message straight to")} <strong className="text-slate-200">{users.find(u => u.id === selectedClientForNotif)?.name}</strong>{t("'s mobile notification inbox.")}
                    </p>

                    <form onSubmit={handleSendNotification} className="space-y-4">
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block mb-1">{t('Message Topic / Subject')}</label>
                        <input
                          type="text"
                          required
                          value={notifTitle}
                          onChange={e => setNotifTitle(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block mb-1">{t('Alert Message Body')}</label>
                        <textarea
                          rows={3}
                          required
                          placeholder={t('Your exclusive 20% discount on haircuts is ready for use...')}
                          value={notifMessage}
                          onChange={e => setNotifMessage(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {t('Dispatch Push Alert')}
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* F. PROMOTIONAL DESK */}
          {activeTab === 'promotions' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Deploy New Promotion */}
              <div className="p-6 rounded-3xl bg-[#090d16] border border-slate-850">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-5 flex items-center gap-2">
                  <Percent className="h-4 w-4 text-amber-500" />
                  {t('Deploy New Promotional Campaign Offer')}
                </h3>

                <form onSubmit={handleCreatePromotion} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">{t('Promo Banner Title')}</label>
                    <input
                      type="text"
                      required
                      placeholder={t('e.g. VIP Haircut Discount')}
                      value={promoTitle}
                      onChange={e => setPromoTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">{t('Discount Amount Label')}</label>
                    <input
                      type="text"
                      required
                      placeholder={t('e.g. 20% OFF or $15 OFF')}
                      value={promoDiscount}
                      onChange={e => setPromoDiscount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">{t('Max Bookings Limit')}</label>
                    <input
                      type="number"
                      required
                      placeholder={t('100')}
                      value={promoLimit}
                      onChange={e => setPromoLimit(e.target.value)}
                      className="w-full bg-[#03060a] border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">{t('Offer Summary / Fine Print')}</label>
                    <input
                      type="text"
                      placeholder={t('e.g. Save 20% on any premium treatment with the crew...')}
                      value={promoDesc}
                      onChange={e => setPromoDesc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        {t('Deploy Offer')}
                      </button>
                  </div>
                </form>
              </div>

              {/* Active list of marketing promotions */}
              <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">{t('Active Campaign Directory')}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {promotions.map(p => (
                    <div key={p.id} className="p-6 rounded-3xl bg-[#090d16] border border-slate-850 flex flex-col justify-between group relative">
                      
                      {/* Trash action */}
                      <button
                        onClick={() => onRemovePromotion(p.id)}
                        className="absolute top-4 right-4 p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:scale-105 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                        title={t('Withdraw Promotion')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[10px] font-bold">
                            {p.discount}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{t('Limit:')} {p.bookingLimit} {t('bookings')}</span>
                        </div>

                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-200">{p.title}</h5>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                          {p.description || t('Exclusive VIP loyalty point campaign.')}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-850/65 mt-5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>{t('Starts:')} {p.startDate}</span>
                        <span>{t('Redeemed:')} <strong className="text-slate-350">{p.bookingsCount}</strong> {t('times')}</span>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}


