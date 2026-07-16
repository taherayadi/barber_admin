import { User, Appointment, Barber, Review, Notification, ServiceItem, ServiceCategory, Promotion } from './types';

const BASE = '/api';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// --- Seed ---
export async function seedDatabase(): Promise<void> {
  await api('/seed', { method: 'POST' });
}

// --- Barbers ---
export async function fetchBarbers(): Promise<Barber[]> {
  return api<Barber[]>('/barbers');
}
export async function createBarber(b: Barber): Promise<Barber> {
  return api<Barber>('/barbers', { method: 'POST', body: JSON.stringify(b) });
}
export async function updateBarber(b: Barber): Promise<void> {
  await api(`/barbers/${b.id}`, { method: 'PUT', body: JSON.stringify(b) });
}
export async function deleteBarber(id: string): Promise<void> {
  await api(`/barbers/${id}`, { method: 'DELETE' });
}

// --- Users ---
export async function fetchUsers(): Promise<User[]> {
  return api<User[]>('/users');
}
export async function createUser(u: User): Promise<User> {
  return api<User>('/users', { method: 'POST', body: JSON.stringify(u) });
}
export async function updateUser(u: User): Promise<void> {
  await api(`/users/${u.id}`, { method: 'PUT', body: JSON.stringify(u) });
}
export async function deleteUser(id: string): Promise<void> {
  await api(`/users/${id}`, { method: 'DELETE' });
}

// --- Appointments ---
export async function fetchAppointments(): Promise<Appointment[]> {
  return api<Appointment[]>('/appointments');
}
export async function createAppointment(a: Appointment): Promise<Appointment> {
  return api<Appointment>('/appointments', { method: 'POST', body: JSON.stringify(a) });
}
export async function updateAppointment(a: Appointment): Promise<void> {
  await api(`/appointments/${a.id}`, { method: 'PUT', body: JSON.stringify(a) });
}
export async function deleteAppointment(id: string): Promise<void> {
  await api(`/appointments/${id}`, { method: 'DELETE' });
}

// --- Services ---
export async function fetchServices(): Promise<ServiceItem[]> {
  return api<ServiceItem[]>('/services');
}
export async function createService(s: ServiceItem): Promise<ServiceItem> {
  return api<ServiceItem>('/services', { method: 'POST', body: JSON.stringify(s) });
}
export async function deleteService(id: string): Promise<void> {
  await api(`/services/${id}`, { method: 'DELETE' });
}

// --- Categories ---
export async function fetchCategories(): Promise<ServiceCategory[]> {
  return api<ServiceCategory[]>('/categories');
}
export async function createCategory(c: ServiceCategory): Promise<ServiceCategory> {
  return api<ServiceCategory>('/categories', { method: 'POST', body: JSON.stringify(c) });
}
export async function deleteCategory(id: string): Promise<void> {
  await api(`/categories/${id}`, { method: 'DELETE' });
}

// --- Reviews ---
export async function fetchReviews(): Promise<Review[]> {
  return api<Review[]>('/reviews');
}
export async function createReview(r: Review): Promise<Review> {
  return api<Review>('/reviews', { method: 'POST', body: JSON.stringify(r) });
}

// --- Notifications ---
export async function fetchNotifications(): Promise<Notification[]> {
  return api<Notification[]>('/notifications');
}
export async function createNotification(n: Notification): Promise<Notification> {
  return api<Notification>('/notifications', { method: 'POST', body: JSON.stringify(n) });
}
export async function markNotificationRead(id: string, read: boolean): Promise<void> {
  await api(`/notifications/${id}`, { method: 'PUT', body: JSON.stringify({ read }) });
}
export async function deleteNotification(id: string): Promise<void> {
  await api(`/notifications/${id}`, { method: 'DELETE' });
}

// --- Promotions ---
export async function fetchPromotions(): Promise<Promotion[]> {
  return api<Promotion[]>('/promotions');
}
export async function createPromotion(p: Promotion): Promise<Promotion> {
  return api<Promotion>('/promotions', { method: 'POST', body: JSON.stringify(p) });
}
export async function deletePromotion(id: string): Promise<void> {
  await api(`/promotions/${id}`, { method: 'DELETE' });
}

// --- Settings ---
export async function fetchPointValue(): Promise<number> {
  const data = await api<{ pointValue: number }>('/settings');
  return data.pointValue;
}
export async function updatePointValue(val: number): Promise<void> {
  await api('/settings', { method: 'PUT', body: JSON.stringify({ pointValue: val }) });
}
