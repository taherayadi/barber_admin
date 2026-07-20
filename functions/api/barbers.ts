import { Env, jsonResponse, errorResponse } from '../_middleware';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB.prepare('SELECT * FROM barbers').all();
  const barbers = results.map((r: any) => ({
    id: r.id, name: r.name, specialty: r.specialty, rating: r.rating,
    reviewsCount: r.reviews_count, avatar: r.avatar, bio: r.bio,
    availableTimes: JSON.parse(r.available_times || '[]'),
    servicesAllowed: r.services_allowed ? JSON.parse(r.services_allowed) : undefined,
  }));
  return jsonResponse(barbers);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const b = await context.request.json() as any;
  await context.env.DB.prepare(
    'INSERT INTO barbers (id, name, specialty, rating, reviews_count, avatar, bio, available_times, services_allowed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(b.id, b.name, b.specialty || '', b.rating || 5.0, b.reviewsCount || 0, b.avatar || '', b.bio || '', JSON.stringify(b.availableTimes || []), b.servicesAllowed ? JSON.stringify(b.servicesAllowed) : null).run();
  return jsonResponse(b, 201);
};
