/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Appointment, Barber, Review, Notification, ServiceItem, ServiceCategory, Promotion } from '../types';
import { INITIAL_BARBERS, SERVICES, INITIAL_REVIEWS } from '../data';

const APPOINTMENTS_KEY = 'barber_app_appointments';
const BARBERS_KEY = 'barber_app_barbers';
const REVIEWS_KEY = 'barber_app_reviews';
const NOTIFICATIONS_KEY = 'barber_app_notifications';
const CURRENT_USER_KEY = 'barber_app_current_user';
const USERS_KEY = 'barber_app_users';
const SERVICES_KEY = 'barber_app_services';
const CATEGORIES_KEY = 'barber_app_categories';
const PROMOTIONS_KEY = 'barber_app_promotions';

export const DEFAULT_PROMOTIONS: Promotion[] = [
  {
    id: 'p1',
    title: 'Executive Royal Ceremony Offer',
    description: 'Elevate your aesthetic with our Signature Combo. Includes custom skin fade, hot towel straight-razor shave, and luxury clay scalp therapy.',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600',
    discount: '25% OFF SPECIAL',
    startDate: '2026-06-01',
    endDate: '2026-06-15',
    bookingLimit: 20,
    bookingsCount: 4
  },
  {
    id: 'p2',
    title: 'Midweek Golden Shave & Tea',
    description: 'Beat the weekend rush. Refresh with a premium hot-towel treatment and custom beard conditioning oil, served with English Earl Grey tea.',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600',
    discount: '$12 BARBER BONUS',
    startDate: '2026-06-03',
    endDate: '2026-06-10',
    bookingLimit: 15,
    bookingsCount: 7
  }
];

export const DEFAULT_CATEGORIES: ServiceCategory[] = [
  { id: 'haircut', name: 'Precision Cuts & Fades', description: 'Standard hair styling, tailored scissor cuts, line-ups, and skin fades.', bgClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', fillClass: 'bg-emerald-500', textClass: 'text-emerald-450' },
  { id: 'shave', name: 'Luxury Hot Towel Shaves', description: 'Classic straight-razor groom with hot steam towels, lather, and conditioning oils.', bgClass: 'bg-purple-500/10 border-purple-500/20 text-purple-400', fillClass: 'bg-purple-500', textClass: 'text-purple-400' },
  { id: 'combo', name: 'Signature Combos', description: 'Curated value bundles matching haircuts with facial beard styling or shampoos.', bgClass: 'bg-amber-500/10 border-amber-500/20 text-amber-500', fillClass: 'bg-amber-500', textClass: 'text-amber-550' },
  { id: 'treatment', name: 'Scalp & Skin Treatments', description: 'Revitalizing clay head masks, pneumatic pressure massages, and follicle detoxes.', bgClass: 'bg-sky-500/10 border-sky-500/20 text-sky-400', fillClass: 'bg-sky-500', textClass: 'text-sky-400' }
];

// Initialize default users
export const DEFAULT_USERS: User[] = [
  {
    id: 'u1',
    name: 'Taher Ayadi',
    email: 'taherayadi1990@gmail.com',
    role: 'client',
    loyaltyPoints: 120,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'u2',
    name: 'Alex Mercer',
    email: 'alex@gmail.com',
    role: 'client',
    loyaltyPoints: 35,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'admin1',
    name: 'Barberhouse Admin',
    email: 'admin@barbershop.com',
    role: 'admin',
    loyaltyPoints: 0,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
  }
];

export const DEFAULT_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    clientId: 'u1',
    clientName: 'Taher Ayadi',
    clientEmail: 'taherayadi1990@gmail.com',
    barberId: 'b1',
    barberName: 'Marcus Vance',
    date: '2026-06-04',
    time: '11:00',
    service: SERVICES[0], // Classic Precision Cut
    price: 35,
    status: 'confirmed',
    pointsEarned: 10,
    pointsRedeemed: 0,
    rated: false
  },
  {
    id: 'a2',
    clientId: 'u1',
    clientName: 'Taher Ayadi',
    clientEmail: 'taherayadi1990@gmail.com',
    barberId: 'b4',
    barberName: 'Andre Dubois',
    date: '2026-05-28',
    time: '14:00',
    service: SERVICES[1], // Hot Towel
    price: 30,
    status: 'completed',
    pointsEarned: 8,
    pointsRedeemed: 0,
    rated: true
  },
  {
    id: 'a3',
    clientId: 'u2',
    clientName: 'Alex Mercer',
    clientEmail: 'alex@gmail.com',
    barberId: 'b2',
    barberName: 'Sofia Russo',
    date: '2026-06-05',
    time: '14:30',
    service: SERVICES[2], // Combo
    price: 55,
    status: 'pending',
    pointsEarned: 20,
    pointsRedeemed: 0,
    rated: false
  }
];

export const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    clientId: 'u1',
    title: 'Appointment Confirmed',
    message: 'Your booking with Marcus Vance on Jun 4, 11:00 AM has been successfully confirmed.',
    date: '2026-06-03T18:45:00Z',
    read: false,
    type: 'booking'
  },
  {
    id: 'n2',
    clientId: 'u1',
    title: 'Loyalty Points Earned!',
    message: 'You have earned 8 loyalty points from your completed Royal Hot Towel Shave appointment.',
    date: '2026-05-28T15:00:00Z',
    read: true,
    type: 'loyalty'
  }
];

export const getStoredUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  if (!data) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  return JSON.parse(data);
};

export const saveStoredUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getStoredCurrentUser = (): User => {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  if (!data) {
    // Default to Admin
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(DEFAULT_USERS[2]));
    return DEFAULT_USERS[2];
  }
  return JSON.parse(data);
};

export const saveStoredCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const getStoredAppointments = (): Appointment[] => {
  const data = localStorage.getItem(APPOINTMENTS_KEY);
  if (!data) {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(DEFAULT_APPOINTMENTS));
    return DEFAULT_APPOINTMENTS;
  }
  return JSON.parse(data);
};

export const saveStoredAppointments = (appointments: Appointment[]) => {
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
};

export const getStoredBarbers = (): Barber[] => {
  const data = localStorage.getItem(BARBERS_KEY);
  if (!data) {
    localStorage.setItem(BARBERS_KEY, JSON.stringify(INITIAL_BARBERS));
    return INITIAL_BARBERS;
  }
  return JSON.parse(data);
};

export const saveStoredBarbers = (barbers: Barber[]) => {
  localStorage.setItem(BARBERS_KEY, JSON.stringify(barbers));
};

export const getStoredReviews = (): Review[] => {
  const data = localStorage.getItem(REVIEWS_KEY);
  if (!data) {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(INITIAL_REVIEWS));
    return INITIAL_REVIEWS;
  }
  return JSON.parse(data);
};

export const saveStoredReviews = (reviews: Review[]) => {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
};

export const getStoredNotifications = (): Notification[] => {
  const data = localStorage.getItem(NOTIFICATIONS_KEY);
  if (!data) {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
    return DEFAULT_NOTIFICATIONS;
  }
  return JSON.parse(data);
};

export const saveStoredNotifications = (notifications: Notification[]) => {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

export const getStoredServices = (): ServiceItem[] => {
  const data = localStorage.getItem(SERVICES_KEY);
  if (!data) {
    localStorage.setItem(SERVICES_KEY, JSON.stringify(SERVICES));
    return SERVICES;
  }
  return JSON.parse(data);
};

export const saveStoredServices = (services: ServiceItem[]) => {
  localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
};

export const getStoredCategories = (): ServiceCategory[] => {
  const data = localStorage.getItem(CATEGORIES_KEY);
  if (!data) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  return JSON.parse(data);
};

export const saveStoredCategories = (categories: ServiceCategory[]) => {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

const POINT_VALUE_KEY = 'barber_app_point_value';

export const getStoredPointValue = (): number => {
  const val = localStorage.getItem(POINT_VALUE_KEY);
  if (val === null) {
    localStorage.setItem(POINT_VALUE_KEY, '0.01');
    return 0.01;
  }
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0.01 : parsed;
};

export const saveStoredPointValue = (value: number) => {
  localStorage.setItem(POINT_VALUE_KEY, value.toString());
};

export const getStoredPromotions = (): Promotion[] => {
  const data = localStorage.getItem(PROMOTIONS_KEY);
  if (!data) {
    localStorage.setItem(PROMOTIONS_KEY, JSON.stringify(DEFAULT_PROMOTIONS));
    return DEFAULT_PROMOTIONS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_PROMOTIONS;
  }
};

export const saveStoredPromotions = (promotions: Promotion[]) => {
  localStorage.setItem(PROMOTIONS_KEY, JSON.stringify(promotions));
};

