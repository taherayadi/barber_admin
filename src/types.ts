/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'client' | 'admin';
  loyaltyPoints: number;
  avatar: string;
  password?: string;
}

export interface Barber {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewsCount: number;
  avatar: string;
  bio: string;
  availableTimes: string[];
  servicesAllowed?: string[]; // IDs of services/operations this barber is qualified to perform
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  pointsGiven: number; // loyalty points awarded on completion
  pointsCost: number; // cost in points to redeem for free
  description: string;
  category: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  bgClass: string;
  fillClass: string;
  textClass: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  barberId: string;
  barberName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  service: ServiceItem;
  price: number; // Actual paid price (0 if redeemed using points)
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  pointsEarned: number;
  pointsRedeemed: number; // non-zero if points were spent to make it free
  rated: boolean;
}

export interface Review {
  id: string;
  barberId: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Notification {
  id: string;
  clientId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'booking' | 'system' | 'loyalty' | 'reminder' | 'review';
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  discount: string;
  startDate: string;
  endDate: string;
  bookingLimit: number;
  bookingsCount: number;
  active: boolean;
}

