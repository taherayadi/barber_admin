import React, { useState, useEffect, useRef } from 'react';
import { Scissors, Info } from 'lucide-react';

import { User, Appointment, Barber, Review, Notification, ServiceItem, ServiceCategory, Promotion } from './types';
import * as api from './api';
import { SettingsProvider, useT } from './i18n';

import AuthScreen from './components/AuthScreen';
import NotificationBanner from './components/NotificationBanner';
import AdminApp from './components/AdminApp';
import ClientApp from './components/ClientApp';
import SettingsToggle from './components/SettingsToggle';

interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'system' | 'loyalty' | 'reminder' | 'review';
}

const CURRENT_USER_KEY = 'barber_app_current_user';

function getStoredCurrentUser(): User | null {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  if (!data) return null;
  try { return JSON.parse(data); } catch { return null; }
}

function saveStoredCurrentUser(user: User | null) {
  if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(CURRENT_USER_KEY);
}

function AppInner() {
  const t = useT();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [pointValue, setPointValue] = useState<number>(0.01);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeToast, setActiveToast] = useState<NotificationToast | null>(null);
  // Tracks promo ids that were recently mutated locally so the 5s poll doesn't clobber them
  const promoDirtyUntil = useRef<Record<string, number>>({});

  useEffect(() => {
    const init = async () => {
      try {
        await api.seedDatabase();
        const [u, b, a, r, n, s, c, pv, p] = await Promise.all([
          api.fetchUsers(),
          api.fetchBarbers(),
          api.fetchAppointments(),
          api.fetchReviews(),
          api.fetchNotifications(),
          api.fetchServices(),
          api.fetchCategories(),
          api.fetchPointValue(),
          api.fetchPromotions(),
        ]);
        setAllUsers(u);
        setBarbers(b);
        setAppointments(a);
        setReviews(r);
        setNotifications(n);
        setServices(s);
        setCategories(c);
        setPointValue(pv);
        setPromotions(p);

        const stored = getStoredCurrentUser();
        if (stored) {
          const freshUser = u.find((usr: User) => usr.id === stored.id);
          setCurrentUser(freshUser || stored);
        }
      } catch (err) {
        console.error('Failed to init from DB:', err);
        const stored = getStoredCurrentUser();
        if (stored) setCurrentUser(stored);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Live polling: keep dynamic data fresh so admin sees new client bookings
  // and users see new notifications without a manual refresh.
  useEffect(() => {
    if (!currentUser) return;
    const poll = async () => {
      try {
        const [a, n, u, r, b, s, c, p] = await Promise.all([
          api.fetchAppointments(),
          api.fetchNotifications(),
          api.fetchUsers(),
          api.fetchReviews(),
          api.fetchBarbers(),
          api.fetchServices(),
          api.fetchCategories(),
          api.fetchPromotions(),
        ]);
        setAppointments(a);
        setNotifications(n);
        setAllUsers(u);
        setReviews(r);
        setBarbers(b);
        setServices(s);
        setCategories(c);
        const now = Date.now();
        const dirty = promoDirtyUntil.current;
        setPromotions(prev => {
          // keep locally-mutated promos until their dirty window expires
          const merged = p.map((np: Promotion) =>
            dirty[np.id] && now < dirty[np.id] ? (prev.find(x => x.id === np.id) ?? np) : np
          );
          // include any promos present locally but missing from the fetch (e.g. just created)
          prev.forEach(x => { if (!p.find(np => np.id === x.id)) merged.push(x); });
          return merged;
        });
        // Keep the logged-in user's live data (e.g. loyalty points) in sync
        const fresh = u.find((usr: User) => usr.id === currentUser.id);
        if (fresh) setCurrentUser((prev: User | null) => prev ? { ...prev, ...fresh, password: undefined } : prev);
      } catch {
        /* ignore transient polling errors */
      }
    };
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [currentUser]);

  const triggerToast = (title: string, message: string, type: NotificationToast['type']) => {
    setActiveToast({ id: 'toast_' + Math.floor(Math.random() * 100000), title, message, type });
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    saveStoredCurrentUser(user);
    triggerToast(t('Secure Entrance Verified'), t('Access granted as {name}.', { name: user.name }), 'system');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveStoredCurrentUser(null);
    triggerToast(t('Access Expired'), t('You have successfully logged out of the parlor portal.'), 'system');
  };

  const handleRegister = async (name: string, email: string, password: string, role: 'client' | 'admin') => {
    const newUser: User = {
      id: 'u_' + Math.floor(Math.random() * 100000),
      name, email, role: role || 'client',
      loyaltyPoints: role === 'client' ? 25 : 0,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      password
    };
    const created = await api.createUser(newUser) as User;
    const stored: User = { ...created, password: undefined };
    const updated = [...allUsers, stored];
    setAllUsers(updated);
    handleLogin(stored);
  };

  const handleAddReview = async (barberId: string, rating: number, comment: string) => {
    if (!currentUser) return;
    const newReview: Review = {
      id: 'r_' + Math.floor(Math.random() * 100000),
      barberId, clientName: currentUser.name, rating, comment,
      date: new Date().toISOString().slice(0, 10)
    };
    await api.createReview(newReview);
    setReviews(prev => [...prev, newReview]);
  };

  const handleAddAppointment = async (appointment: Appointment) => {
    const created = await api.createAppointment(appointment);
    setAppointments(prev => [...prev, created]);
    const newNotif: Notification = {
      id: 'notif_' + Math.floor(Math.random() * 100000),
      clientId: appointment.clientId,
      title: 'Booking Received',
      message: `Your request with ${appointment.barberName} on ${appointment.date} at ${appointment.time} has been received and is awaiting approval.`,
      date: new Date().toISOString(), read: false, type: 'booking'
    };
    await api.createNotification(newNotif);
    setNotifications(prev => [...prev, newNotif]);
  };

  const handleClientCancelAppointment = async (id: string) => {
    const target = appointments.find(a => a.id === id);
    await api.deleteAppointment(id);
    setAppointments(prev => prev.filter(a => a.id !== id));
    if (target) {
      const newNotif: Notification = {
        id: 'notif_' + Math.floor(Math.random() * 100000),
        clientId: target.clientId,
        title: 'Appointment Cancelled',
        message: `Your appointment with ${target.barberName} has been cancelled.`,
        date: new Date().toISOString(), read: false, type: 'booking'
      };
      await api.createNotification(newNotif);
      setNotifications(prev => [...prev, newNotif]);
    }
  };

  const handleMarkNotificationsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) {
      await api.markNotificationRead(n.id, true);
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleRedeemPoints = async (pointsCost: number) => {
    if (!currentUser) return;
    const next = Math.max(0, currentUser.loyaltyPoints - pointsCost);
    const updated = { ...currentUser, loyaltyPoints: next };
    await api.updateUser(updated);
    setCurrentUser(updated);
    setAllUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  const handleConfirmAppointment = async (id: string) => {
    const app = appointments.find(a => a.id === id);
    if (!app) return;
    const updatedApp = { ...app, status: 'confirmed' as const };
    await api.updateAppointment(updatedApp);
    setAppointments(prev => prev.map(a => a.id === id ? updatedApp : a));

    const newNotif: Notification = {
      id: 'notif_' + Math.floor(Math.random() * 100000),
      clientId: app.clientId,
      title: 'Appointment Approved!',
      message: `Great news! Your booking with ${app.barberName} on ${app.date} at ${app.time} has been approved. See you at the salon!`,
      date: new Date().toISOString(), read: false, type: 'booking'
    };
    await api.createNotification(newNotif);
    setNotifications(prev => [...prev, newNotif]);
    triggerToast(t('Appointment Approved'), t('Approved booking for {clientName}.', { clientName: app.clientName }), 'system');
  };

  const handleCompleteAppointment = async (id: string) => {
    const app = appointments.find(a => a.id === id);
    if (!app) return;
    const updatedApp = { ...app, status: 'completed' as const };
    await api.updateAppointment(updatedApp);
    setAppointments(prev => prev.map(a => a.id === id ? updatedApp : a));

    const pointsCredited = app.service.pointsGiven;
    const updatedUsers = allUsers.map(u =>
      u.id === app.clientId ? { ...u, loyaltyPoints: u.loyaltyPoints + pointsCredited } : u
    );
    setAllUsers(updatedUsers);
    const affectedUser = updatedUsers.find(u => u.id === app.clientId);
    if (affectedUser) await api.updateUser(affectedUser);

    const notif1: Notification = {
      id: 'notif_' + Math.floor(Math.random() * 100000),
      clientId: app.clientId,
      title: `Loyalty Points Awarded (+${pointsCredited} PTS)`,
      message: `Excellent! You earned ${pointsCredited} loyalty group points from completing your ${app.service.name}!`,
      date: new Date().toISOString(), read: false, type: 'loyalty'
    };
    const notif2: Notification = {
      id: 'notif_' + Math.floor(Math.random() * 100000),
      clientId: app.clientId,
      title: `Rate Your Experience with ${app.barberName}`,
      message: `How was your trim? Please take a moment to rate your barber on your appointment logs.`,
      date: new Date(Date.now() + 1000).toISOString(), read: false, type: 'review'
    };
    await api.createNotification(notif1);
    await api.createNotification(notif2);
    setNotifications(prev => [...prev, notif1, notif2]);
    triggerToast(t('Service Completed'), t('Marked complete. +{pointsCredited} loyalty points awarded.', { pointsCredited }), 'loyalty');
  };

  const handleCancelAppointment = async (id: string) => {
    const app = appointments.find(a => a.id === id);
    if (!app) return;
    const updatedApp = { ...app, status: 'cancelled' as const };
    await api.updateAppointment(updatedApp);
    setAppointments(prev => prev.map(a => a.id === id ? updatedApp : a));

    const newNotif: Notification = {
      id: 'notif_' + Math.floor(Math.random() * 100000),
      clientId: app.clientId,
      title: 'Appointment Cancelled',
      message: `Your appointment with ${app.barberName} has been cancelled by an administrator.`,
      date: new Date().toISOString(), read: false, type: 'booking'
    };
    await api.createNotification(newNotif);
    setNotifications(prev => [...prev, newNotif]);
    triggerToast(t('Booking Cancelled'), t('Cancelled booking for {clientName}.', { clientName: app.clientName }), 'booking');
  };

  const handleSendCustomNotification = async (clientId: string, title: string, message: string) => {
    const newNotif: Notification = {
      id: 'notif_' + Math.floor(Math.random() * 100000),
      clientId, title, message,
      date: new Date().toISOString(), read: false, type: 'system'
    };
    await api.createNotification(newNotif);
    setNotifications(prev => [...prev, newNotif]);
    triggerToast(t('Notification Sent'), t('Custom client alert sent successfully.'), 'system');
  };

  const handleUpdateClientPoints = async (userId: string, pointsDelta: number) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    const nextPoints = Math.max(0, user.loyaltyPoints + pointsDelta);
    const updatedUser = { ...user, loyaltyPoints: nextPoints };
    await api.updateUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));

    const newNotif: Notification = {
      id: 'notif_' + Math.floor(Math.random() * 100000),
      clientId: userId,
      title: `Loyalty Balance Adjusted (${pointsDelta > 0 ? '+' : ''}${pointsDelta} PTS)`,
      message: `An administrator has adjusted your loyalty points account balance. Your new balance is ${nextPoints} points.`,
      date: new Date().toISOString(), read: false, type: 'loyalty'
    };
    await api.createNotification(newNotif);
    setNotifications(prev => [...prev, newNotif]);
    triggerToast(t('Points Adjusted'), t('Customer loyalty balance updated.'), 'loyalty');
  };

  const handleAddBarber = async (newBarber: Barber) => {
    await api.createBarber(newBarber);
    setBarbers(prev => [...prev, newBarber]);
    triggerToast(t('Barber Added'), t('{newBarberName} joined the roster.', { newBarberName: newBarber.name }), 'system');
  };

  const handleRemoveBarber = async (id: string) => {
    const target = barbers.find(b => b.id === id);
    await api.deleteBarber(id);
    setBarbers(prev => prev.filter(b => b.id !== id));
    if (target) triggerToast(t('Barber Removed'), t('{targetName} was removed from the roster.', { targetName: target.name }), 'system');
  };

  const handleAddService = async (newService: ServiceItem) => {
    await api.createService(newService);
    setServices(prev => [...prev, newService]);
    triggerToast(t('Service Added'), t('{newServiceName} has been added.', { newServiceName: newService.name }), 'system');
  };

  const handleRemoveService = async (id: string) => {
    const target = services.find(s => s.id === id);
    await api.deleteService(id);
    setServices(prev => prev.filter(s => s.id !== id));
    if (target) triggerToast(t('Service Removed'), t('{targetName} has been removed.', { targetName: target.name }), 'system');
  };

  const handleAddCategory = async (newCategory: ServiceCategory) => {
    await api.createCategory(newCategory);
    setCategories(prev => [...prev, newCategory]);
    triggerToast(t('Category Added'), t('Category {newCategoryName} was added.', { newCategoryName: newCategory.name }), 'system');
  };

  const handleRemoveCategory = async (id: string) => {
    const target = categories.find(c => c.id === id);
    await api.deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
    if (target) triggerToast(t('Category Removed'), t('Category {targetName} was removed.', { targetName: target.name }), 'system');
  };

  const handleUpdatePointValue = async (val: number) => {
    await api.updatePointValue(val);
    setPointValue(val);
    triggerToast(t('Rate Updated'), t('Exchange rate set to {val} TND per point.', { val: val.toFixed(2) }), 'system');
  };

  const handleAddPromotion = async (newPromo: Promotion) => {
    await api.createPromotion(newPromo);
    setPromotions(prev => [...prev, newPromo]);
    triggerToast(t('Promo Created'), t('Campaign "{newPromoTitle}" is now live.', { newPromoTitle: newPromo.title }), 'system');
  };

  const handleRemovePromotion = async (id: string) => {
    const target = promotions.find(p => p.id === id);
    await api.deletePromotion(id);
    setPromotions(prev => prev.filter(p => p.id !== id));
    if (target) triggerToast(t('Promo Removed'), t('Campaign "{targetTitle}" was removed.', { targetTitle: target.title }), 'system');
  };

  const handleUpdatePromotion = async (updated: Promotion) => {
    // Optimistic update first so the UI reflects the change immediately
    setPromotions(prev => prev.map(p => p.id === updated.id ? updated : p));
    promoDirtyUntil.current[updated.id] = Date.now() + 6000;
    try {
      const saved = await api.updatePromotion(updated);
      setPromotions(prev => prev.map(p => p.id === updated.id ? saved : p));
    } catch {
      // revert on failure
      setPromotions(prev => prev.map(p => p.id === updated.id ? { ...p } : p));
    }
    triggerToast(t('Promo Updated'), t('Campaign "{updatedTitle}" was saved.', { updatedTitle: updated.title }), 'system');
  };

  const handleUsePromotion = async (promoId: string) => {
    const target = promotions.find(p => p.id === promoId);
    if (!target) return;
    const incremented: Promotion = { ...target, bookingsCount: (target.bookingsCount || 0) + 1 };
    setPromotions(prev => prev.map(p => p.id === promoId ? incremented : p));
    promoDirtyUntil.current[promoId] = Date.now() + 6000;
    try {
      await api.updatePromotion(incremented);
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="bg-[#07090f] text-slate-100 min-h-screen flex items-center justify-center font-sans">
        <SettingsToggle />
        <div className="text-center">
          <Scissors className="h-10 w-10 text-amber-500 mx-auto mb-4 animate-pulse" />
          <p className="text-sm text-slate-400 font-mono uppercase tracking-widest">{t('LIVE METRICS ACTIVE')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#07090f] text-slate-100 min-h-screen relative font-sans">
      <NotificationBanner toast={activeToast} onClose={() => setActiveToast(null)} />

      {!currentUser ? (
        <AuthScreen
          onLogin={handleLogin}
          allUsers={allUsers}
          onRegister={handleRegister}
        />
      ) : currentUser.role === 'admin' ? (
        <AdminApp
          currentUser={currentUser}
          onLogout={handleLogout}
          appointments={appointments}
          barbers={barbers}
          users={allUsers}
          reviews={reviews}
          onConfirmAppointment={handleConfirmAppointment}
          onCompleteAppointment={handleCompleteAppointment}
          onCancelAppointment={handleCancelAppointment}
          onSendCustomNotification={handleSendCustomNotification}
          onUpdateClientPoints={handleUpdateClientPoints}
          onAddBarber={handleAddBarber}
          onRemoveBarber={handleRemoveBarber}
          services={services}
          onAddService={handleAddService}
          onRemoveService={handleRemoveService}
          categories={categories}
          onAddCategory={handleAddCategory}
          onRemoveCategory={handleRemoveCategory}
          pointValue={pointValue}
          onUpdatePointValue={handleUpdatePointValue}
          promotions={promotions}
          onAddPromotion={handleAddPromotion}
          onRemovePromotion={handleRemovePromotion}
          onUpdatePromotion={handleUpdatePromotion}
        />
      ) : (
        <ClientApp
          user={currentUser}
          onLogout={handleLogout}
          appointments={appointments}
          barbers={barbers}
          reviews={reviews}
          notifications={notifications}
          onAddReview={handleAddReview}
          onAddAppointment={handleAddAppointment}
          onCancelAppointment={handleClientCancelAppointment}
          onMarkNotificationsRead={handleMarkNotificationsRead}
          onRedeemPoints={handleRedeemPoints}
          services={services}
          categories={categories}
          pointValue={pointValue}
          promotions={promotions}
          onUsePromotion={handleUsePromotion}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppInner />
    </SettingsProvider>
  );
}
