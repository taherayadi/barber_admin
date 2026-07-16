import React, { useState, useEffect } from 'react';
import { Scissors, Info } from 'lucide-react';

import { User, Appointment, Barber, Review, Notification, ServiceItem, ServiceCategory, Promotion } from './types';
import * as api from './api';

import AuthScreen from './components/AuthScreen';
import NotificationBanner from './components/NotificationBanner';
import AdminApp from './components/AdminApp';

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

export default function App() {
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

  const triggerToast = (title: string, message: string, type: NotificationToast['type']) => {
    setActiveToast({ id: 'toast_' + Math.floor(Math.random() * 100000), title, message, type });
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    saveStoredCurrentUser(user);
    triggerToast('Secure Entrance Verified', `Access granted as ${user.name}.`, 'system');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveStoredCurrentUser(null);
    triggerToast('Access Expired', 'You have successfully logged out of the parlor portal.', 'system');
  };

  const handleRegister = async (name: string, email: string, role: 'client' | 'admin') => {
    const newUser: User = {
      id: 'u_' + Math.floor(Math.random() * 100000),
      name, email, role: role || 'admin',
      loyaltyPoints: role === 'client' ? 25 : 0,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
    };
    await api.createUser(newUser);
    const updated = [...allUsers, newUser];
    setAllUsers(updated);
    handleLogin(newUser);
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
    triggerToast('Appointment Approved', `Approved booking for ${app.clientName}.`, 'system');
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
    triggerToast('Service Completed', `Marked complete. +${pointsCredited} loyalty points awarded.`, 'loyalty');
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
    triggerToast('Booking Cancelled', `Cancelled booking for ${app.clientName}.`, 'booking');
  };

  const handleSendCustomNotification = async (clientId: string, title: string, message: string) => {
    const newNotif: Notification = {
      id: 'notif_' + Math.floor(Math.random() * 100000),
      clientId, title, message,
      date: new Date().toISOString(), read: false, type: 'system'
    };
    await api.createNotification(newNotif);
    setNotifications(prev => [...prev, newNotif]);
    triggerToast('Notification Sent', 'Custom client alert sent successfully.', 'system');
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
    triggerToast('Points Adjusted', 'Customer loyalty balance updated.', 'loyalty');
  };

  const handleAddBarber = async (newBarber: Barber) => {
    await api.createBarber(newBarber);
    setBarbers(prev => [...prev, newBarber]);
    triggerToast('Barber Added', `${newBarber.name} joined the roster.`, 'system');
  };

  const handleRemoveBarber = async (id: string) => {
    const target = barbers.find(b => b.id === id);
    await api.deleteBarber(id);
    setBarbers(prev => prev.filter(b => b.id !== id));
    if (target) triggerToast('Barber Removed', `${target.name} was removed from the roster.`, 'system');
  };

  const handleAddService = async (newService: ServiceItem) => {
    await api.createService(newService);
    setServices(prev => [...prev, newService]);
    triggerToast('Service Added', `${newService.name} has been added.`, 'system');
  };

  const handleRemoveService = async (id: string) => {
    const target = services.find(s => s.id === id);
    await api.deleteService(id);
    setServices(prev => prev.filter(s => s.id !== id));
    if (target) triggerToast('Service Removed', `${target.name} has been removed.`, 'system');
  };

  const handleAddCategory = async (newCategory: ServiceCategory) => {
    await api.createCategory(newCategory);
    setCategories(prev => [...prev, newCategory]);
    triggerToast('Category Added', `Category ${newCategory.name} was added.`, 'system');
  };

  const handleRemoveCategory = async (id: string) => {
    const target = categories.find(c => c.id === id);
    await api.deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
    if (target) triggerToast('Category Removed', `Category ${target.name} was removed.`, 'system');
  };

  const handleUpdatePointValue = async (val: number) => {
    await api.updatePointValue(val);
    setPointValue(val);
    triggerToast('Rate Updated', `Exchange rate set to $${val.toFixed(2)} per point.`, 'system');
  };

  const handleAddPromotion = async (newPromo: Promotion) => {
    await api.createPromotion(newPromo);
    setPromotions(prev => [...prev, newPromo]);
    triggerToast('Promo Created', `Campaign "${newPromo.title}" is now live.`, 'system');
  };

  const handleRemovePromotion = async (id: string) => {
    const target = promotions.find(p => p.id === id);
    await api.deletePromotion(id);
    setPromotions(prev => prev.filter(p => p.id !== id));
    if (target) triggerToast('Promo Removed', `Campaign "${target.title}" was removed.`, 'system');
  };

  if (loading) {
    return (
      <div className="bg-[#07090f] text-slate-100 min-h-screen flex items-center justify-center font-sans">
        <div className="text-center">
          <Scissors className="h-10 w-10 text-amber-500 mx-auto mb-4 animate-pulse" />
          <p className="text-sm text-slate-400 font-mono uppercase tracking-widest">Initializing Systems...</p>
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
      ) : (
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
        />
      )}
    </div>
  );
}
