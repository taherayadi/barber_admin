import { Env, jsonResponse } from '../_middleware';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB.prepare('SELECT * FROM services').all();
  const services = results.map((r: any) => ({
    id: r.id, name: r.name, price: r.price, duration: r.duration,
    pointsGiven: r.points_given, pointsCost: r.points_cost,
    description: r.description, category: r.category,
  }));
  return jsonResponse(services);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const s = await context.request.json() as any;
  await context.env.DB.prepare(
    'INSERT INTO services (id, name, price, duration, points_given, points_cost, description, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(s.id, s.name, s.price, s.duration, s.pointsGiven || 0, s.pointsCost || 0, s.description || '', s.category || '').run();
  return jsonResponse(s, 201);
};
