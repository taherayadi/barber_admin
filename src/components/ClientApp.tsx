/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Calendar,
  Gift,
  Bell,
  User as UserIcon,
  LogOut,
  Star,
  Clock,
  DollarSign,
  Award,
  ChevronRight,
  MapPin,
  Check,
  Scissors,
  ArrowLeft,
  X,
  Plus,
  Send,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useT } from '../i18n';
import { User, Barber, ServiceItem, Appointment, Review, Notification, ServiceCategory, Promotion } from '../types';
import { formatPrice } from '../utils/format';
import SettingsToggle from './SettingsToggle';
// NOTE: No static demo data is imported. All data comes from the API.

interface ClientAppProps {
  user: User;
  onLogout: () => void;
  appointments: Appointment[];
  barbers: Barber[];
  reviews: Review[];
  notifications: Notification[];
  onAddReview: (barberId: string, rating: number, comment: string) => void;
  onAddAppointment: (appointment: Appointment) => void;
  onCancelAppointment: (id: string) => void;
  onMarkNotificationsRead: () => void;
  onRedeemPoints: (pointsCost: number) => void;
  services?: ServiceItem[];
  categories?: ServiceCategory[];
  pointValue?: number;
  promotions?: Promotion[];
  onUsePromotion?: (promoId: string) => void;
}

export default function ClientApp({
  user,
  onLogout,
  appointments,
  barbers,
  reviews,
  notifications,
  onAddReview,
  onAddAppointment,
  onCancelAppointment,
  onMarkNotificationsRead,
  onRedeemPoints,
  services = [],
  categories = [],
  pointValue = 0.01,
  promotions = [],
  onUsePromotion = () => {}
}: ClientAppProps) {
  const t = useT();
  const [activeTab, setActiveTab] = useState<'home' | 'book' | 'history' | 'notifications'>('home');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Booking state
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [redeemWithPoints, setRedeemWithPoints] = useState<boolean>(false);

  // Filtered Services List based on category partition
  const filteredServices = useMemo(() => {
    if (categoryFilter === 'all') return services;
    return services.filter(s => s.category === categoryFilter);
  }, [services, categoryFilter]);
  
  // Review state
  const [reviewModalBarber, setReviewModalBarber] = useState<Barber | null>(null);
  const [reviewAppointmentId, setReviewAppointmentId] = useState<string | null>(null);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  // Selected barber for detail modal
  const [detailBarber, setDetailBarber] = useState<Barber | null>(null);

  // Promotion related states
  const [promoCarouselIndex, setPromoCarouselIndex] = useState<number>(0);
  const [detailedPromo, setDetailedPromo] = useState<Promotion | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [redeemPointsAsDiscount, setRedeemPointsAsDiscount] = useState<boolean>(false);

  const visiblePromotions = useMemo(
    () => promotions.filter(p => p.active !== false),
    [promotions]
  );

  // Cross-validation of chosen barber vs selected operation qualification
  useEffect(() => {
    if (selectedBarber && selectedService) {
      const allowed = selectedBarber.servicesAllowed;
      if (allowed && allowed.length > 0 && !allowed.includes(selectedService.id)) {
        setSelectedBarber(null);
        setSelectedTime('');
      }
    }
  }, [selectedService?.id, selectedBarber?.id]);

  // Time slots helper
   const availableDates = [
     { label: t('Today'), value: new Date().toISOString().split('T')[0] },
     { label: t('Tomorrow'), value: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
     { label: t('Day After'), value: new Date(Date.now() + 172800000).toISOString().split('T')[0] }
   ];

  // Map state values
  const unreadCount = notifications.filter(n => n.clientId === user.id && !n.read).length;
  const userAppointments = appointments.filter(a => a.clientId === user.id);
  const userLoyaltyPoints = user.loyaltyPoints;

  const getServicePointsCost = (s: ServiceItem): number => {
    return pointValue > 0 ? Math.ceil(s.price / pointValue) : s.pointsCost;
  };

  // Points tier calculations
  const nextTierPoints = 150;
  const progressPercent = Math.min((userLoyaltyPoints / nextTierPoints) * 100, 100);

  const getDiscountedPrice = (servicePrice: number): number => {
    if (!appliedPromo) return servicePrice;
    const discountVal = appliedPromo.discount.toLowerCase();
    
    try {
      if (discountVal.includes('%')) {
        const match = discountVal.match(/\d+/);
        const pct = match ? parseInt(match[0], 10) : 0;
        return Math.max(0, parseFloat((servicePrice * (1 - pct / 100)).toFixed(2)));
      } else {
        const match = discountVal.match(/\d+/);
        const val = match ? parseInt(match[0], 10) : 0;
        return Math.max(0, parseFloat((servicePrice - val).toFixed(2)));
      }
    } catch (e) {
      return servicePrice;
    }
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) return;

    let price = selectedService.price;
    let pointsRedeemed = 0;
    let pointsEarned = selectedService.pointsGiven;

    if (redeemWithPoints) {
      price = 0;
      pointsRedeemed = getServicePointsCost(selectedService);
      pointsEarned = 0;
    } else {
      const basePriceAfterPromo = getDiscountedPrice(selectedService.price);
      
      if (redeemPointsAsDiscount) {
        const userPointsValue = userLoyaltyPoints * pointValue;
        const partialPointsDiscount = Math.min(userPointsValue, basePriceAfterPromo);
        price = parseFloat((basePriceAfterPromo - partialPointsDiscount).toFixed(2));
        pointsRedeemed = pointValue > 0 ? Math.min(userLoyaltyPoints, Math.ceil(partialPointsDiscount / pointValue)) : 0;
        pointsEarned = price > 0 ? selectedService.pointsGiven : 0;
      } else {
        price = basePriceAfterPromo;
        pointsRedeemed = 0;
        pointsEarned = selectedService.pointsGiven;
      }
    }

    const newBooking: Appointment = {
      id: 'app_' + Math.floor(Math.random() * 100000),
      clientId: user.id,
      clientName: user.name,
      clientEmail: user.email,
      barberId: selectedBarber.id,
      barberName: selectedBarber.name,
      date: selectedDate,
      time: selectedTime,
      service: selectedService,
      price: price,
      status: 'pending',
      pointsEarned: pointsEarned,
      pointsRedeemed: pointsRedeemed,
      rated: false
    };

    if (pointsRedeemed > 0) {
      onRedeemPoints(pointsRedeemed);
    }

    if (appliedPromo) {
      onUsePromotion(appliedPromo.id);
      setAppliedPromo(null);
    }

    onAddAppointment(newBooking);
    
    // Reset booking state
    setSelectedService(null);
    setSelectedBarber(null);
    setSelectedDate('');
    setSelectedTime('');
    setRedeemWithPoints(false);
    setRedeemPointsAsDiscount(false);
    
    // Switch to appointments tab
    setActiveTab('history');
  };

  const handleOpenReviewModal = (barberId: string, appointmentId: string) => {
    const target = barbers.find(b => b.id === barberId);
    if (target) {
      setReviewModalBarber(target);
      setReviewAppointmentId(appointmentId);
      setRatingInput(5);
      setReviewComment('');
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalBarber || !reviewAppointmentId) return;

    onAddReview(reviewModalBarber.id, ratingInput, reviewComment);
    
    // Mark appointment as rated
    const app = appointments.find(a => a.id === reviewAppointmentId);
    if (app) {
      app.rated = true;
    }
    
    setReviewModalBarber(null);
    setReviewAppointmentId(null);
  };

  const formatDateLabel = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', weekday: 'short' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <div className="flex flex-col bg-[#0b0f19] h-[100dvh] sm:h-[100dvh] sm:my-4 text-slate-100 relative rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl border border-slate-800 font-sans max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full mx-auto" style={{ minHeight: '680px' }}>

      {/* HEADER SECTION */}
      <header className="p-5 flex justify-between items-center bg-[#0d1321] border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full border-2 border-amber-500 shadow-md ring-4 ring-amber-500/10 object-cover"
          />
          <div>
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">{t('Welcome back')}</span>
            <h2 className="text-sm font-extrabold text-slate-100 mt-[-2px]">{user.name}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Notifications Icon Button */}
          <button
            onClick={() => {
              setActiveTab('notifications');
              onMarkNotificationsRead();
            }}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 relative text-slate-300 transition-colors cursor-pointer border-none"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-0.5 bg-red-500 text-slate-50 text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse border border-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          <SettingsToggle />

          {/* Logout Button */}
          <button
            onClick={onLogout}
            title={t('Log Out')}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-rose-450 transition-colors cursor-pointer border-none"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* COMPONENT BODY */}
      <main className="flex-grow overflow-y-auto p-4 space-y-4 min-h-0 bg-[#080c14] pb-24">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* BRAND PROMOTIONS BANNER CAROUSEL */}
              {visiblePromotions.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center px-1">
                      <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-ping"></span>
                        {t('Exclusive Store Special Offers')} [{visiblePromotions.length}]
                      </h3>
                    <div className="flex gap-1">
                      {visiblePromotions.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPromoCarouselIndex(idx)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            promoCarouselIndex === idx ? 'w-4 bg-amber-500' : 'w-1.5 bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {visiblePromotions[promoCarouselIndex] && (() => {
                      const promo = visiblePromotions[promoCarouselIndex];
                      const slotsLeft = Math.max(0, promo.bookingLimit - promo.bookingsCount);
                      const percentClaimed = Math.min(100, (promo.bookingsCount / promo.bookingLimit) * 100);
                      
                      return (
                        <motion.div
                          key={promo.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => setDetailedPromo(promo)}
                          className="group relative h-[155px] bg-slate-900 rounded-3xl border border-slate-850 overflow-hidden shadow-xl cursor-pointer hover:border-amber-500/35 transition-all duration-200"
                        >
                          {/* Image background */}
                          <div className="absolute inset-0 z-0">
                            <img
                              src={promo.image}
                              alt={promo.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover brightness-[0.45] group-hover:scale-105 transition-transform duration-500"
                            />
                             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
                          </div>

                          {/* Content overlay */}
                          <div className="absolute inset-0 z-10 p-4.5 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[9px] font-black uppercase rounded-lg tracking-wider shadow-md shadow-amber-950/35">
                                {promo.discount}
                              </span>
                              {slotsLeft <= 5 && slotsLeft > 0 && (
                                <span className="px-2 py-0.5 bg-rose-950/90 border border-rose-500/30 text-rose-450 text-[8px] font-black uppercase rounded-md tracking-wider font-mono">
                                  {t('🔥 Selling out fast!')}
                                </span>
                              )}
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-xs font-black text-white group-hover:text-amber-400 transition-colors line-clamp-1 pr-6 font-sans">
                                {promo.title}
                              </h4>
                               <p className="text-[10px] text-white/90 font-medium line-clamp-2 leading-relaxed drop-shadow-sm">
                                 {promo.description}
                               </p>

                              {/* Progress for Limit booking spots */}
                              <div className="pt-1 flex items-center justify-between gap-3 text-[9px]">
                                <div className="flex-grow max-w-[130px] h-1.5 bg-slate-950/70 border border-slate-850/40 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                                    style={{ width: `${percentClaimed}%` }}
                                  />
                                </div>
                                <span className="text-white/80 font-mono scale-90 origin-right font-semibold">
                                  {slotsLeft > 0 ? t('{slotsLeft} of {bookingLimit} spots remaining', { slotsLeft, bookingLimit: promo.bookingLimit }) : t('Full / Limit reached')}
                               </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Subtle Chevron indicator */}
                          <div className="absolute bottom-4 right-4 z-10 h-6 w-6 bg-slate-950/80 rounded-full flex items-center justify-center border border-slate-850/60 text-slate-400 group-hover:text-amber-400 group-hover:border-amber-500/20 transition-all">
                            <ChevronRight className="h-3 w-3" />
                          </div>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>
                </div>
              )}

              {/* LOYALTY CARD COMPONENT */}
              <div className="bg-gradient-to-br from-slate-900 to-[#121a2e] border border-amber-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
                <div className="absolute top-[-25%] right-[-10%] w-[120px] h-[120px] rounded-full bg-amber-500/5 blur-[30px] pointer-events-none" />
                
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 font-mono text-[9px] uppercase font-bold rounded-full tracking-wider border border-amber-500/20">
                      {t('VVIP Loyalty Club')}
                    </span>
                    <div className="mt-3.5 space-y-1">
                      <p className="text-2xl font-black font-sans text-white tracking-tight flex items-baseline gap-1.5">
                        {userLoyaltyPoints}{' '}
                        <span className="text-xs font-semibold text-slate-400 font-sans tracking-normal">{t('points')}</span>
                      </p>
                      <p className="text-[10px] text-slate-450 font-mono flex items-center gap-1.5 flex-wrap">
                         <span className="px-1.5 py-0.5 bg-slate-950/80 text-amber-500 font-black rounded-lg border border-slate-850">
                            {t('Est. Value')}: {formatPrice(userLoyaltyPoints * pointValue)}
                         </span>
                         <span className="text-slate-600">•</span>
                          <span className="text-slate-500 font-medium">{t('1 PT')} = {formatPrice(pointValue)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="h-10 w-10 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400">
                    <Gift className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs font-medium text-slate-400">
                    <span>{t('Progress to free treatment')}</span>
                    <span>{userLoyaltyPoints}/{nextTierPoints} {t('PTS')}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                   <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                     {userLoyaltyPoints >= nextTierPoints 
                       ? t("🎉 You have enough points! Redeem points during your next booking.")
                       : t('Earn {points} more points to get a free service of your choosing!', { points: nextTierPoints - userLoyaltyPoints })
                     }
                   </p>
                </div>
              </div>

              {/* QUICK CALL TO ACTION: BOOK NOW */}
              <button
                onClick={() => setActiveTab('book')}
                className="w-full py-4.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black tracking-wide text-xs uppercase rounded-2xl shadow-lg shadow-amber-950/20 flex items-center justify-center gap-2 cursor-pointer border-none transition-transform active:scale-[0.98]"
              >
                <Scissors className="h-4 w-4 stroke-[2.5]" />
                 <span>{t('Reserve Appointment Slot')}</span>
              </button>

              {/* BARBERS LIST */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">{t('Our Elite Barbers')}</h3>
                  <span className="text-[10px] text-amber-500 font-semibold font-mono">{t('Tap for biography')}</span>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {barbers.map((barber) => (
                    <div
                      key={barber.id}
                      onClick={() => setDetailBarber(barber)}
                      className="flex items-center gap-3.5 p-3.5 bg-slate-900/50 border border-slate-800/80 rounded-2xl hover:border-slate-700 transition-all cursor-pointer group"
                    >
                      <img
                        src={barber.avatar}
                        alt={barber.name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-800 group-hover:scale-[1.03] transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-extrabold text-slate-100 font-sans tracking-tight">
                          {barber.name}
                        </h4>
                        <p className="text-xs text-slate-400 font-sans truncate mt-0.5">
                          {barber.specialty}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <span className="text-xs font-bold text-slate-200">
                            {barber.rating.toFixed(1)}
                          </span>
                           <span className="text-[10px] text-slate-500">
                             ({barber.reviewsCount} {t('reviews')})
                           </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>

              {/* DYNAMIC CATEGORIES SCROLLER */}
              {categories.length > 0 && (
                <div className="space-y-2">
                   <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase font-mono">{t('Service Segments')}</h3>
                  <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
                    <button
                      type="button"
                      onClick={() => setCategoryFilter('all')}
                      className={`px-3.5 py-1.5 text-[10px] font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer border shrink-0 ${
                        categoryFilter === 'all'
                          ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md'
                          : 'bg-slate-900/45 border-slate-850 text-slate-400 hover:text-slate-200'
                      }`}
                     >
                       {t('All Services')}
                     </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryFilter(cat.id)}
                        className={`px-3.5 py-1.5 text-[10px] font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer border shrink-0 ${
                          categoryFilter === cat.id
                            ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md'
                            : 'bg-slate-900/45 border-slate-850 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SERVICES MINI GRID */}
              <div className="space-y-3">
                 <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">{t('Premium Operations')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {filteredServices.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setSelectedService(s);
                        setActiveTab('book');
                      }}
                      className="p-3.5 bg-slate-900/30 border border-slate-800/60 rounded-2xl flex flex-col justify-between hover:border-amber-500/20 cursor-pointer group transition-all"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-amber-400 transition-colors">
                          {s.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                          {s.description}
                        </p>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-900">
                        <span className="text-xs font-extrabold text-amber-500">{formatPrice(s.price)}</span>
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                             +{s.pointsGiven} {t('PTS')}
                          </span>
                          <span className="text-[8px] font-mono text-slate-500 scale-[0.9] origin-right mt-0.5">
                            val. {formatPrice(s.pointsGiven * pointValue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredServices.length === 0 && (
                   <p className="text-center font-bold text-slate-500 italic text-[10px] py-4">{t('No treatments or services registered in this category.')}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: ACTIVE BOOK FLOW */}
          {activeTab === 'book' && (
            <motion.div
              key="book"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-1.5 mb-2">
                 <h3 className="text-sm font-bold text-slate-350 tracking-wide uppercase">{t('Request Custom Appointment')}</h3>
              </div>

              {appliedPromo && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-2xl flex items-center justify-between text-xs font-medium font-sans">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500 shrink-0 animate-pulse" />
                     <span>{t('Promo Applied:')} <strong className="text-white uppercase px-1.5 py-0.5 bg-amber-500 text-slate-950 rounded-md font-mono font-black text-[10px]">{appliedPromo.discount}</strong> {t('on checkout')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAppliedPromo(null)}
                    className="h-5 w-5 rounded-full hover:bg-amber-500/15 flex items-center justify-center text-slate-400 hover:text-amber-500 cursor-pointer border-none"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              <form onSubmit={handleBookAppointment} className="space-y-4">
                
                {/* 1. SELECT SERVICE */}
                <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-3">
                   <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                     {t('1. Select Operation')}
                   </label>
                  <div className="space-y-2">
                    {services.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSelectedService(s);
                          // Reset points check if they change service
                          setRedeemWithPoints(false);
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                          selectedService?.id === s.id
                            ? 'bg-amber-500/10 border-amber-500/60'
                            : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                        }`}
                      >
                        <div className="flex-1 pr-3">
                          <h4 className="text-xs font-bold text-slate-200">{s.name}</h4>
                           <span className="text-[10px] text-slate-500">{s.duration} {t('min duration')}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-amber-500 block">{formatPrice(s.price)}</span>
                            <span className="text-[9px] text-slate-500 font-mono">{t('Redeem with')} {getServicePointsCost(s)} {t('PTS')}</span>
                          <span className="text-[8px] text-slate-500/80 font-mono block">Valued: {formatPrice(getServicePointsCost(s) * pointValue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. SELECT BARBER */}
                {selectedService && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-3"
                  >
                     <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                       {t('2. Choose Stylist')}
                     </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {(() => {
                        const qualifiedBarbers = barbers.filter((b) => {
                          if (!b.servicesAllowed || b.servicesAllowed.length === 0) return true;
                          return b.servicesAllowed.includes(selectedService.id);
                        });
                        if (qualifiedBarbers.length === 0) {
                          return (
                             <p className="col-span-2 text-center text-xs text-slate-500 py-3.5 font-sans">
                               {t('No stylist is qualified to perform this service currently.')}
                             </p>
                          );
                        }
                        return qualifiedBarbers.map((b) => (
                          <div
                            key={b.id}
                            onClick={() => {
                              setSelectedBarber(b);
                              setSelectedTime('');
                            }}
                            className={`p-3 rounded-xl border cursor-pointer text-center flex flex-col items-center transition-all ${
                              selectedBarber?.id === b.id
                                ? 'bg-amber-500/10 border-amber-500/60'
                                : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                            }`}
                          >
                            <img
                              src={b.avatar}
                              alt={b.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-850 mb-2"
                            />
                            <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{b.name}</h4>
                            <div className="flex items-center gap-1 justify-center mt-1">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              <span className="text-[10px] font-bold text-slate-350">{b.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </motion.div>
                )}

                {/* 3. SELECT DATE & TIME */}
                {selectedBarber && selectedService && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-4"
                  >
                    <div className="space-y-2">
                       <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                         {t('3. Appointment Date')}
                       </label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableDates.map((dateObj) => {
                          const isInRange = !appliedPromo || (dateObj.value >= appliedPromo.startDate && dateObj.value <= appliedPromo.endDate);
                          return (
                            <button
                              type="button"
                              key={dateObj.value}
                              disabled={!isInRange}
                              onClick={() => {
                                setSelectedDate(dateObj.value);
                                setSelectedTime('');
                              }}
                              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center font-sans ${
                                !isInRange
                                  ? 'bg-slate-950/20 border-slate-900 opacity-40 cursor-not-allowed select-none'
                                  : selectedDate === dateObj.value
                                    ? 'bg-amber-500/10 border-amber-500/60 text-amber-400 font-bold'
                                    : 'bg-slate-950/40 border-slate-850 hover:border-slate-800 cursor-pointer text-slate-300'
                              }`}
                            >
                              <span className="text-[10px] font-bold text-slate-400 block">{dateObj.label}</span>
                              <span className="text-[9px] text-slate-500 block">{formatDateLabel(dateObj.value)}</span>
                              {!isInRange && (
                                 <span className="text-[7.5px] text-rose-500/95 font-mono font-bold block mt-1 leading-none uppercase">
                                   {t('No promo range')}
                                 </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selectedDate && (
                      <div className="space-y-2">
                         <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                           {t('4. Available Hours')}
                         </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {selectedBarber.availableTimes.map((timeSlot) => {
                            const isReserved = appointments.some(
                              a => a.barberId === selectedBarber.id && 
                                   a.date === selectedDate && 
                                   a.time === timeSlot && 
                                   a.status !== 'cancelled'
                            );
                            return (
                              <button
                                key={timeSlot}
                                type="button"
                                disabled={isReserved}
                                onClick={() => setSelectedTime(timeSlot)}
                                className={`py-2 text-[11px] font-semibold rounded-lg border font-mono transition-all relative ${
                                  isReserved
                                    ? 'bg-slate-950/20 border-slate-900/60 opacity-35 line-through text-slate-500 cursor-not-allowed select-none'
                                    : selectedTime === timeSlot
                                      ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                                      : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700 cursor-pointer'
                                }`}
                              >
                                {timeSlot}
                                 {isReserved && (
                                   <span className="sr-only"> {t('(Reserved)')}</span>
                                 )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 4. POINT REDEMPTION & CONFIRM CARD */}
                {selectedTime && selectedDate && selectedBarber && selectedService && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-slate-900 border border-amber-500/20 rounded-2xl space-y-4 shadow-xl"
                  >
                     <h4 className="text-xs font-bold text-slate-350 tracking-wider uppercase border-b border-slate-800 pb-2">
                       {t('Booking Information Invoice')}
                     </h4>
                     
                     <div className="space-y-2 text-xs">
                       <div className="flex justify-between">
                         <span className="text-slate-400">{t('Treatment')}</span>
                         <span className="font-semibold text-slate-200">{selectedService.name}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-slate-400">{t('Barber Master')}</span>
                         <span className="font-semibold text-slate-200">{selectedBarber.name}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-slate-400">{t('Date & Hour')}</span>
                        <span className="font-semibold text-amber-400 font-mono">
                          {formatDateLabel(selectedDate)} • {selectedTime}
                        </span>
                      </div>
                                       {/* Loyalty Point Redemption Option */}
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-3 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Gift className="h-4 w-4 text-amber-500" />
                           <span className="text-xs font-bold text-slate-300">{t('Spend loyalty points?')}</span>
                        </div>
                            <span className="text-[11px] text-slate-500 font-mono font-bold">
                               {t('Avail')}: {userLoyaltyPoints} {t('PTS')} ({formatPrice(userLoyaltyPoints * pointValue)})
                            </span>
                      </div>
                      
                      {/* Option 1: Redeem fully for FREE (if they have enough points for pointsCost) */}
                      {userLoyaltyPoints >= getServicePointsCost(selectedService) ? (
                        <div className="flex items-start gap-2.5 p-2 bg-amber-500/5 rounded-xl border border-amber-500/10">
                          <input
                            type="checkbox"
                            id="redeem_pts"
                            checked={redeemWithPoints}
                            onChange={(e) => {
                              setRedeemWithPoints(e.target.checked);
                              if (e.target.checked) setRedeemPointsAsDiscount(false);
                            }}
                            className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500/40 h-4 w-4 mt-0.5 cursor-pointer"
                          />
                           <label htmlFor="redeem_pts" className="text-[11px] text-slate-300 cursor-pointer select-none leading-normal">
                                                            {t('Redeem')} <strong className="text-amber-400 font-mono">{getServicePointsCost(selectedService)} {t('PTS')}</strong> <span className="text-slate-500 text-[10px] font-mono">{t('(worth {worth} TND)', { worth: (getServicePointsCost(selectedService) * pointValue).toFixed(2) })}</span> {t('to get this treatment completely')} <strong className="text-emerald-400">{t('FREE')}</strong>!
                           </label>
                        </div>
                      ) : (
                         <div className="p-2 bg-slate-900 border border-slate-850 rounded-xl text-[10px] text-slate-500 leading-normal">
                            {t('Requires {pts} {ptsLabel} to redeem fully free (You are currently short {short} {ptsLabel}).', { pts: getServicePointsCost(selectedService), short: getServicePointsCost(selectedService) - userLoyaltyPoints, ptsLabel: t('PTS') })}
                         </div>
                      )}

                      {/* Option 2: Apply partial loyalty cash rewards */}
                      {userLoyaltyPoints > 0 && (
                        (() => {
                          const basePriceAfterPromo = getDiscountedPrice(selectedService.price);
                          const userPointsValue = userLoyaltyPoints * pointValue;
                          const actualDiscount = Math.min(userPointsValue, basePriceAfterPromo);
                          const pointsNeeded = pointValue > 0 ? Math.min(userLoyaltyPoints, Math.ceil(actualDiscount / pointValue)) : 0;
                          
                          return (
                            <div className="flex items-start gap-2.5 p-2 bg-slate-900 rounded-xl border border-slate-850">
                              <input
                                type="checkbox"
                                id="redeem_discount"
                                checked={redeemPointsAsDiscount}
                                onChange={(e) => {
                                  setRedeemPointsAsDiscount(e.target.checked);
                                  if (e.target.checked) setRedeemWithPoints(false);
                                }}
                                className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500/40 h-4 w-4 mt-0.5 cursor-pointer"
                              />
                                <label htmlFor="redeem_discount" className="text-[11px] text-slate-300 cursor-pointer select-none leading-normal">
                                                                    {t('Use point balance cash-in: spend')} <strong className="text-amber-400 font-mono">{pointsNeeded} {t('PTS')}</strong> {t('to get a direct')} <strong className="text-rose-400">-{actualDiscount.toFixed(2)} TND</strong> {t('partial discount!')}
                                </label>
                            </div>
                          );
                        })()
                      )}

                      {userLoyaltyPoints === 0 && (
                         <p className="text-[10px] text-slate-500 italic text-center select-none py-1.5">
                           {t('No loyalty points currently available to discount this booking.')}
                         </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                       <span className="text-xs font-bold text-slate-400">{t('Total Price Due:')}</span>
                      <span className="text-lg font-black text-white font-sans">
                        {redeemWithPoints ? (
                           <span className="text-emerald-400 flex items-center gap-1 text-sm uppercase">
                             <Check className="h-4 w-4 stroke-[3]" /> {t('Free (Redeemed)')}
                           </span>
                        ) : redeemPointsAsDiscount ? (
                          (() => {
                            const basePriceAfterPromo = getDiscountedPrice(selectedService.price);
                            const userPointsValue = userLoyaltyPoints * pointValue;
                            const discount = Math.min(userPointsValue, basePriceAfterPromo);
                            const finalPrice = Math.max(0, basePriceAfterPromo - discount);
                            return (
                                 <div className="flex items-center gap-2">
                                 <span className="text-xs text-slate-500 line-through">{formatPrice(selectedService.price)}</span>
                                  {appliedPromo && (
                                    <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-sans uppercase">{t('Promo')}</span>
                                  )}
                                  <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-sans uppercase">-{discount.toFixed(2)} {t('pts')}</span>
                                 <span className="text-amber-400 font-bold">{formatPrice(finalPrice)}</span>
                               </div>
                             );
                           })()
                         ) : appliedPromo ? (
                           <div className="flex items-center gap-2">
                             <span className="text-xs text-slate-500 line-through">{formatPrice(selectedService.price)}</span>
                             <span className="text-amber-400 font-bold">{formatPrice(getDiscountedPrice(selectedService.price))}</span>
                           </div>
                         ) : (
                           formatPrice(selectedService.price)
                         )}
                      </span>
                    </div>    </div>

                    <button
                      type="submit"
                      className="w-full py-4.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black tracking-wider text-xs uppercase rounded-xl cursor-pointer border-none transition-all shadow-md active:scale-95"
                    >
                       {t('Process & Transmit Reservation')}
                    </button>
                  </motion.div>
                )}
              </form>
            </motion.div>
          )}

          {/* TAB 3: APPOINTMENTS HISTORY */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
               <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">{t('My Reservations')}</h3>

              {userAppointments.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/30 border border-slate-850 rounded-2xl space-y-3">
                  <Calendar className="h-8 w-8 text-slate-650 mx-auto" />
                   <p className="text-xs text-slate-400 font-sans">{t('You do not have any active appointments booked yet.')}</p>
                   <button
                     onClick={() => setActiveTab('book')}
                     className="p-2 px-4 bg-amber-500/10 text-amber-400 text-xs font-bold font-sans rounded-xl border border-amber-500/20 hover:bg-amber-500/20"
                   >
                     {t('Book First Slot')}
                   </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {userAppointments
                    .slice()
                    .reverse() // Current on top
                    .map((app) => (
                      <div
                        key={app.id}
                        className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl relative overflow-hidden"
                      >
                        {/* Status Tag */}
                        <div className="absolute top-4 right-4">
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-sans border ${
                            app.status === 'confirmed'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : app.status === 'pending'
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                              : app.status === 'completed'
                              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          }`}>
                             {t(app.status)}
                           </span>
                        </div>

                        <div className="space-y-1.5">
                           <span className="text-[10px] text-slate-500 font-bold font-mono">{t('ID')}: {app.id.toUpperCase()}</span>
                          <h4 className="text-sm font-extrabold text-slate-250 leading-snug">{app.service.name}</h4>
                           <p className="text-xs text-slate-400">{t('Stylist')}: <span className="font-semibold text-slate-200">{app.barberName}</span></p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3 text-amber-500" />
                            <span className="font-semibold text-slate-200 font-mono">
                              {formatDateLabel(app.date)} • {app.time}
                            </span>
                          </p>
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-3.5 border-t border-slate-900/80">
                          <div>
                             <span className="text-[10px] text-slate-500 block">{t('Payment Method')}</span>
                             <span className="text-xs font-black text-slate-100">
                                {app.price === 0 ? t('Loyalty Points Redeemed') : `${formatPrice(app.price)} ${t('Cash')}`}
                             </span>
                          </div>
                          
                          {/* Rating and Points display */}
                          {app.status === 'completed' && !app.rated && (
                            <button
                              onClick={() => handleOpenReviewModal(app.barberId, app.id)}
                              className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-sans font-bold text-[10px] uppercase rounded-lg border-none cursor-pointer tracking-wider flex items-center gap-1 transition-colors"
                            >
                               <Star className="h-3 w-3 fill-slate-950 text-slate-950" /> {t('Rate Barber')}
                            </button>
                          )}

                          {app.status === 'completed' && app.rated && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-500/20">
                               <Check className="h-3 w-3" /> {t('Reviewed')}
                            </span>
                          )}

                          {app.status === 'pending' && (
                            <button
                              onClick={() => onCancelAppointment(app.id)}
                              className="py-1 px-2.5 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/25 text-rose-450 font-semibold text-[10px] rounded-lg cursor-pointer"
                            >
                               {t('Request Cancellation')}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: NOTIFICATIONS LIST */}
          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">{t('Android System Notifications')}</h3>
                 <span className="text-[10px] text-slate-500 font-mono">{t('In-App Recipient')}</span>
              </div>

              {notifications.filter(n => n.clientId === user.id).length === 0 ? (
                <div className="p-8 text-center bg-slate-900/30 border border-slate-850 rounded-2xl">
                  <Bell className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                   <p className="text-xs text-slate-400 font-sans">{t('You have no notification notifications at this moment.')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications
                    .filter(n => n.clientId === user.id)
                    .slice()
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          notif.read 
                            ? 'bg-slate-900/20 border-slate-850 text-slate-400' 
                            : 'bg-[#0f182c] border-amber-600/25 text-slate-100 shadow-md'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold font-sans flex items-center gap-1.5 text-slate-200">
                            {!notif.read && <span className="h-1.5 w-1.5 bg-amber-500 rounded-full shrink-0"></span>}
                            {notif.title}
                          </h4>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* RATING MODAL (PORTAL SIMULATOR) */}
      <AnimatePresence>
        {reviewModalBarber && (
          <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full bg-[#0d1321] border-t border-slate-800 p-6 rounded-t-[32px] space-y-4"
            >
              <div className="flex justify-between items-center">
                 <h3 className="text-md font-bold text-slate-100">{t('Rate Your Stylist')}</h3>
                <button
                  type="button"
                  onClick={() => {
                    setReviewModalBarber(null);
                    setReviewAppointmentId(null);
                  }}
                  className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 cursor-pointer border-none"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 bg-slate-950/40 rounded-2xl border border-slate-850">
                <img
                  src={reviewModalBarber.avatar}
                  alt={reviewModalBarber.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h4 className="text-sm font-extrabold text-slate-200">{reviewModalBarber.name}</h4>
                  <p className="text-xs text-slate-500">{reviewModalBarber.specialty}</p>
                </div>
              </div>

              <div className="text-center space-y-2 py-2">
                 <p className="text-xs text-slate-400">{t('How would you rate the precision of your cut?')}</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setRatingInput(starValue)}
                      className="p-1 bg-transparent border-none cursor-pointer"
                    >
                      <Star
                        className={`h-8 w-8 stroke-[1.5] ${
                          starValue <= ratingInput
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="space-y-2">
                   <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
                     {t('Tell us more (Optional)')}
                   </label>
                   <textarea
                     rows={3}
                     value={reviewComment}
                     onChange={(e) => setReviewComment(e.target.value)}
                     placeholder={t('E.g., Marcus was extremely professional and gave me a world class scissor skin fade! Guaranteed to visit again.')}
                     className="block w-full p-3.5 bg-slate-950/60 border border-slate-850 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40 rounded-xl text-xs text-slate-200 placeholder-slate-650"
                   />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setReviewModalBarber(null);
                      setReviewAppointmentId(null);
                    }}
                     className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer border-none"
                   >
                     {t('Cancel')}
                   </button>
                   <button
                     type="submit"
                     className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black tracking-wider text-xs uppercase rounded-xl cursor-pointer border-none"
                   >
                     {t('Submit Review & Rate')}
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BARBER BIOGRAPHY DETAIL MODAL */}
      <AnimatePresence>
        {detailBarber && (
          <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0d1321] border border-slate-850 rounded-3xl p-5 max-w-sm w-full space-y-4 relative"
            >
              <button
                onClick={() => setDetailBarber(null)}
                className="absolute top-4 right-4 p-1 rounded-full bg-slate-850 hover:bg-slate-800 border-none cursor-pointer"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>

              <div className="text-center">
                <img
                  src={detailBarber.avatar}
                  alt={detailBarber.name}
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-855 mx-auto mb-3"
                />
                <h3 className="text-md font-extrabold text-slate-100">{detailBarber.name}</h3>
                <span className="text-[11px] text-amber-500 font-bold uppercase">{detailBarber.specialty}</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed text-center italic bg-slate-950/30 p-3.5 rounded-xl border border-slate-900">
                "{detailBarber.bio}"
              </p>

              {/* Qualifications / Allowed Operations */}
              <div className="space-y-1.5">
                 <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{t('Qualified Operations')}</h4>
                <div className="flex flex-wrap gap-1">
                  {!detailBarber.servicesAllowed || detailBarber.servicesAllowed.length === 0 ? (
                     <span className="text-[9px] bg-slate-950/40 border border-slate-900 text-slate-400 px-2 py-0.5 rounded-md font-sans">
                       {t('All Standard Operations')}
                     </span>
                  ) : (
                    detailBarber.servicesAllowed.map((sid) => {
                      const s = services.find((srv) => srv.id === sid);
                      return s ? (
                        <span key={sid} className="text-[10px] bg-amber-500/5 border border-amber-500/10 text-amber-500 px-2 py-0.5 rounded-lg font-sans font-medium">
                          {s.name}
                        </span>
                      ) : null;
                    })
                  )}
                </div>
              </div>

              <div className="space-y-2">
                 <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{t('Barbershop Log Reviews')}</h4>
                <div className="max-h-32 overflow-y-auto space-y-2 pr-1 custom-scroll">
                  {reviews.filter(r => r.barberId === detailBarber.id).length === 0 ? (
                     <p className="text-[10px] text-slate-500 text-center py-2">{t('No reviews filed yet. Be the first!')}</p>
                  ) : (
                    reviews
                      .filter(r => r.barberId === detailBarber.id)
                      .map((review) => (
                        <div key={review.id} className="p-2 bg-slate-950/20 border border-slate-900 rounded-lg text-[10px]">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-300">{review.clientName}</span>
                            <div className="flex items-center gap-0.5 text-amber-500">
                              <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                              <span className="font-bold">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-slate-400 mt-1 italic">"{review.comment}"</p>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedBarber(detailBarber);
                  setDetailBarber(null);
                  setActiveTab('book');
                }}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-[#0d1321] font-black text-xs uppercase tracking-wide rounded-xl border-none cursor-pointer"
              >
                 {t('Book with')} {detailBarber.name}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PROMOTION DETAILED POPUP OVERLAY */}
      <AnimatePresence>
        {detailedPromo && (() => {
          const slotsLeft = Math.max(0, detailedPromo.bookingLimit - detailedPromo.bookingsCount);
          const percentClaimed = Math.min(100, (detailedPromo.bookingsCount / detailedPromo.bookingLimit) * 100);
          return (
            <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#0b101c] border border-slate-850 rounded-3xl overflow-hidden max-w-sm w-full space-y-0 relative shadow-2xl flex flex-col max-h-[90%] font-sans text-slate-200 text-left"
              >
                <div className="relative h-44 shrink-0">
                  <img
                    src={detailedPromo.image}
                    alt={detailedPromo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover brightness-[0.55]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b101c] via-transparent to-transparent" />
                  <button
                    type="button"
                    onClick={() => setDetailedPromo(null)}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 border-none cursor-pointer text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <span className="absolute bottom-4 left-4 px-3 py-1.5 bg-amber-500 text-slate-950 text-xs font-black uppercase rounded-xl tracking-wider shadow-lg font-mono">
                    {detailedPromo.discount}
                  </span>
                </div>

                <div className="p-5 space-y-4 overflow-y-auto custom-scroll flex-1">
                  <div className="space-y-1">
                     <span className="text-[9px] text-amber-500 font-extrabold uppercase tracking-widest font-mono block">
                       {t('Limited Time VIP Campaign')}
                     </span>
                    <h3 className="text-sm font-extrabold text-white leading-snug">{detailedPromo.title}</h3>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {detailedPromo.description}
                  </p>

                  {/* Campaign validity date */}
                  <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-2xl flex justify-between items-center text-[10px] text-slate-400">
                    <div className="space-y-1">
                       <span className="text-[8px] font-bold text-slate-500 uppercase block tracking-wider font-mono">{t('Starts')}</span>
                      <span className="font-mono text-slate-300 font-bold">{detailedPromo.startDate}</span>
                    </div>
                    <div className="text-slate-700 font-bold">→</div>
                    <div className="space-y-1 text-right">
                       <span className="text-[8px] font-bold text-slate-500 uppercase block tracking-wider font-mono">{t('Terminates')}</span>
                      <span className="font-mono text-slate-300 font-bold">{detailedPromo.endDate}</span>
                    </div>
                  </div>

                  {/* Seat limitations remaining */}
                  <div className="space-y-1.5">
                       <div className="flex justify-between text-[10px]">
                         <span className="text-slate-400 font-bold font-sans">{t('Booking Campaign Roster')}</span>
                         <strong className={slotsLeft <= 5 ? 'text-rose-450 font-bold' : 'text-amber-500 font-bold'}>
                           {slotsLeft > 0 ? t('Only {slotsLeft} of {bookingLimit} left!', { slotsLeft, bookingLimit: detailedPromo.bookingLimit }) : t('Campaign sold out')}
                         </strong>
                       </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full border border-slate-850/35 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${slotsLeft <= 5 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-amber-600'}`}
                        style={{ width: `${percentClaimed}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={slotsLeft <= 0}
                      onClick={() => {
                        setAppliedPromo(detailedPromo);
                        if (selectedDate && (selectedDate < detailedPromo.startDate || selectedDate > detailedPromo.endDate)) {
                          setSelectedDate('');
                          setSelectedTime('');
                        }
                        setDetailedPromo(null);
                        setActiveTab('book');
                      }}
                      className={`w-full py-3.5 font-black text-xs uppercase tracking-wider rounded-xl border-none cursor-pointer transition-all ${
                        slotsLeft <= 0
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-950/20'
                      }`}
                    >
                       {slotsLeft <= 0 ? t('Offer Capacity Reached') : t('Claim & Book Special Now')}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* BOTTOM NAVIGATION SCROLL BAR (Jetpack Compose Material navigation replication) */}
      <nav className="absolute bottom-0 left-0 right-0 bg-[#0d1321]/95 backdrop-blur-md border-t border-slate-800/80 px-4 py-3 flex justify-around items-center z-40 shrink-0">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer transition-colors ${
            activeTab === 'home' ? 'text-amber-500 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Home className="h-4.5 w-4.5" />
           <span className="text-[9px] tracking-tight">{t('Main Hub')}</span>
        </button>

        <button
          onClick={() => setActiveTab('book')}
          className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer transition-colors ${
            activeTab === 'book' ? 'text-amber-500 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Calendar className="h-4.5 w-4.5" />
           <span className="text-[9px] tracking-tight">{t('Reserve Slot')}</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer transition-colors ${
            activeTab === 'history' ? 'text-amber-500 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Clock className="h-4.5 w-4.5" />
           <span className="text-[9px] tracking-tight">{t('Bookings')}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('notifications');
            onMarkNotificationsRead();
          }}
          className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer transition-colors ${
            activeTab === 'notifications' ? 'text-amber-500 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <div className="relative">
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-[-2px] right-[-3px] block h-1.5 w-1.5 rounded-full bg-amber-500 ring-2 ring-[#0d1321]" />
            )}
          </div>
           <span className="text-[9px] tracking-tight">{t('System Logs')}</span>
        </button>
      </nav>

    </div>
  );
}
