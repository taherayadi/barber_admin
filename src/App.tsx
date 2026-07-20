import React, { useState, useEffect } from 'react';
import { Scissors, Info } from 'lucide-react';

import { User, Appointment, Barber, Review, Notification, ServiceItem, ServiceCategory, Promotion } from './types';
import {
  getStoredUsers,
  saveStoredUsers,
  getStoredCurrentUser,
  saveStoredCurrentUser,
  getStoredAppointments,
  saveStoredAppointments,
  getStoredBarbers,
  saveStoredBarbers,
  getStoredReviews,
  saveStoredReviews,
  getStoredNotifications,
  saveStoredNotifications,
  getStoredServices,
  saveStoredServices,
  getStoredCategories,
  saveStoredCategories,
  getStoredPointValue,
  saveStoredPointValue,
  getStoredPromotions,
  saveStoredPromotions
} from './utils/storage';

import AuthScreen from './components/AuthScreen';
import NotificationBanner from './components/NotificationBanner';
import AdminApp from './components/AdminApp';

interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'system' | 'loyalty' | 'reminder' | 'review';
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

  // Triggering visual popup toast notification
  const [activeToast, setActiveToast] = useState<NotificationToast | null>(null);

  // Load state on mount
  useEffect(() => {
    setAllUsers(getStoredUsers());
    setCurrentUser(getStoredCurrentUser());
    setAppointments(getStoredAppointments());
    setBarbers(getStoredBarbers());
    setReviews(getStoredReviews());
    setNotifications(getStoredNotifications());
    setServices(getStoredServices());
    setCategories(getStoredCategories());
    setPointValue(getStoredPointValue());
    setPromotions(getStoredPromotions());
  }, []);

  const triggerToast = (title: string, message: string, type: NotificationToast['type']) => {
    setActiveToast({
      id: 'toast_' + Math.floor(Math.random() * 100000),
      title,
      message,
      type
    });
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

  const handleRegister = (name: string, email: string, role: 'client' | 'admin') => {
    const newUser: User = {
      id: 'u_' + Math.floor(Math.random() * 100000),
      name,
      email,
      role: role || 'admin',
      loyaltyPoints: role === 'client' ? 25 : 0,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
    };

    const updated = [...allUsers, newUser];
    setAllUsers(updated);
    saveStoredUsers(updated);
    
    // Automatically log in
    handleLogin(newUser);
  };

  // ADMIN PANEL OPERATIONS
  const handleConfirmAppointment = (id: string) => {
    const updated = appointments.map(a => {
      if (a.id === id) {
        return { ...a, status: 'confirmed' as const };
      }
      return a;
    });
    setAppointments(updated);
    saveStoredAppointments(updated);

    const app = appointments.find(a => a.id === id);
    if (app) {
      const newNotif: Notification = {
        id: 'notif_' + Math.floor(Math.random() * 100000),
        clientId: app.clientId,
        title: 'Appointment Approved!',
        message: `Great news! Your booking with ${app.barberName} on ${app.date} at ${app.time} has been approved. See you at the salon!`,
        date: new Date().toISOString(),
        read: false,
        type: 'booking'
      };
      const updatedNotifs = [...notifications, newNotif];
      setNotifications(updatedNotifs);
      saveStoredNotifications(updatedNotifs);
      triggerToast('Appointment Approved', `Approved booking for ${app.clientName}.`, 'system');
    }
  };

  const handleCompleteAppointment = (id: string) => {
    const updated = appointments.map(a => {
      if (a.id === id) {
        return { ...a, status: 'completed' as const };
      }
      return a;
    });
    setAppointments(updated);
    saveStoredAppointments(updated);

    const app = appointments.find(a => a.id === id);
    if (app) {
      const pointsCredited = app.service.pointsGiven;
      setAllUsers(prevUsers => {
        const nextUsers = prevUsers.map(u => {
          if (u.id === app.clientId) {
            const nextPoints = u.loyaltyPoints + pointsCredited;
            return { ...u, loyaltyPoints: nextPoints };
          }
          return u;
        });
        saveStoredUsers(nextUsers);
        return nextUsers;
      });

      const notif1: Notification = {
        id: 'notif_' + Math.floor(Math.random() * 100000),
        clientId: app.clientId,
        title: `Loyalty Points Awarded (+${pointsCredited} PTS)`,
        message: `Excellent! You earned ${pointsCredited} loyalty group points from completing your ${app.service.name}!`,
        date: new Date().toISOString(),
        read: false,
        type: 'loyalty'
      };

      const notif2: Notification = {
        id: 'notif_' + Math.floor(Math.random() * 100000),
        clientId: app.clientId,
        title: `Rate Your Experience with ${app.barberName}`,
        message: `How was your trim? Please take a moment to rate your barber on your appointment logs.`,
        date: new Date(Date.now() + 1000).toISOString(),
        read: false,
        type: 'review'
      };

      const nextNotifs = [...notifications, notif1, notif2];
      setNotifications(nextNotifs);
      saveStoredNotifications(nextNotifs);

      triggerToast('Service Completed', `Marked complete. +${pointsCredited} loyalty points awarded.`, 'loyalty');
    }
  };

  const handleCancelAppointment = (id: string) => {
    const updated = appointments.map(a => {
      if (a.id === id) {
        return { ...a, status: 'cancelled' as const };
      }
      return a;
    });
    setAppointments(updated);
    saveStoredAppointments(updated);

    const app = appointments.find(a => a.id === id);
    if (app) {
      const newNotif: Notification = {
        id: 'notif_' + Math.floor(Math.random() * 100000),
        clientId: app.clientId,
        title: 'Appointment Cancelled',
        message: `Your appointment with ${app.barberName} has been cancelled by an administrator.`,
        date: new Date().toISOString(),
        read: false,
        type: 'booking'
      };
      const updatedNotifs = [...notifications, newNotif];
      setNotifications(updatedNotifs);
      saveStoredNotifications(updatedNotifs);
      triggerToast('Booking Cancelled', `Cancelled booking for ${app.clientName}.`, 'booking');
    }
  };

  const handleSendCustomNotification = (clientId: string, title: string, message: string) => {
    const newNotif: Notification = {
      id: 'notif_' + Math.floor(Math.random() * 100000),
      clientId,
      title,
      message,
      date: new Date().toISOString(),
      read: false,
      type: 'system'
    };
    const updated = [...notifications, newNotif];
    setNotifications(updated);
    saveStoredNotifications(updated);
    triggerToast('Notification Sent', 'Custom client alert sent successfully.', 'system');
  };

  const handleUpdateClientPoints = (userId: string, pointsDelta: number) => {
    const updated = allUsers.map(u => {
      if (u.id === userId) {
        const nextPoints = Math.max(0, u.loyaltyPoints + pointsDelta);
        return { ...u, loyaltyPoints: nextPoints };
      }
      return u;
    });
    setAllUsers(updated);
    saveStoredUsers(updated);

    const user = allUsers.find(u => u.id === userId);
    if (user) {
      const newNotif: Notification = {
        id: 'notif_' + Math.floor(Math.random() * 100000),
        clientId: userId,
        title: `Loyalty Balance Adjusted (${pointsDelta > 0 ? '+' : ''}${pointsDelta} PTS)`,
        message: `An administrator has adjusted your loyalty points account balance. Your new balance is ${Math.max(0, user.loyaltyPoints + pointsDelta)} points.`,
        date: new Date().toISOString(),
        read: false,
        type: 'loyalty'
      };
      const updatedNotifs = [...notifications, newNotif];
      setNotifications(updatedNotifs);
      saveStoredNotifications(updatedNotifs);
    }
    triggerToast('Points Adjusted', 'Customer loyalty balance updated.', 'loyalty');
  };

  const handleAddBarber = (newBarber: Barber) => {
    const updated = [...barbers, newBarber];
    setBarbers(updated);
    saveStoredBarbers(updated);
    triggerToast('Barber Added', `${newBarber.name} joined the roster.`, 'system');
  };

  const handleRemoveBarber = (id: string) => {
    const target = barbers.find(b => b.id === id);
    const updated = barbers.filter(b => b.id !== id);
    setBarbers(updated);
    saveStoredBarbers(updated);
    if (target) {
      triggerToast('Barber Removed', `${target.name} was removed from the roster.`, 'system');
    }
  };

  const handleAddService = (newService: ServiceItem) => {
    const updated = [...services, newService];
    setServices(updated);
    saveStoredServices(updated);
    triggerToast('Service Added', `${newService.name} has been added.`, 'system');
  };

  const handleRemoveService = (id: string) => {
    const target = services.find(s => s.id === id);
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    saveStoredServices(updated);
    if (target) {
      triggerToast('Service Removed', `${target.name} has been removed.`, 'system');
    }
  };

  const handleAddCategory = (newCategory: ServiceCategory) => {
    const updated = [...categories, newCategory];
    setCategories(updated);
    saveStoredCategories(updated);
    triggerToast('Category Added', `Category ${newCategory.name} was added.`, 'system');
  };

  const handleRemoveCategory = (id: string) => {
    const target = categories.find(c => c.id === id);
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    saveStoredCategories(updated);
    if (target) {
      triggerToast('Category Removed', `Category ${target.name} was removed.`, 'system');
    }
  };

  const handleUpdatePointValue = (val: number) => {
    setPointValue(val);
    saveStoredPointValue(val);
    triggerToast('Rate Updated', `Exchange rate set to $${val.toFixed(2)} per point.`, 'system');
  };

  const handleAddPromotion = (newPromo: Promotion) => {
    const updated = [...promotions, newPromo];
    setPromotions(updated);
    saveStoredPromotions(updated);
    triggerToast('Promo Created', `Campaign "${newPromo.title}" is now live.`, 'system');
  };

  const handleRemovePromotion = (id: string) => {
    const target = promotions.find(p => p.id === id);
    const updated = promotions.filter(p => p.id !== id);
    setPromotions(updated);
    saveStoredPromotions(updated);
    if (target) {
      triggerToast('Promo Removed', `Campaign "${target.title}" was removed.`, 'system');
    }
  };

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
