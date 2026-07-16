import { Env, jsonResponse } from '../_middleware';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB.prepare('SELECT * FROM promotions').all();
  const promos = results.map((r: any) => ({
    id: r.id, title: r.title, description: r.description, image: r.image,
    discount: r.discount, startDate: r.start_date, endDate: r.end_date,
    bookingLimit: r.booking_limit, bookingsCount: r.bookings_count,
  }));
  return jsonResponse(promos);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const p = await context.request.json() as any;
  await context.env.DB.prepare(
    'INSERT INTO promotions (id, title, description, image, discount, start_date, end_date, booking_limit, bookings_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(p.id, p.title, p.description || '', p.image || '', p.discount || '', p.startDate, p.endDate, p.bookingLimit || 0, p.bookingsCount || 0).run();
  return jsonResponse(p, 201);
};
