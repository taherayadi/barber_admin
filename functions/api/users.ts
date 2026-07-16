import { Env, jsonResponse } from '../_middleware';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB.prepare('SELECT * FROM users').all();
  const users = results.map((r: any) => ({
    id: r.id, name: r.name, email: r.email, role: r.role,
    loyaltyPoints: r.loyalty_points, avatar: r.avatar,
  }));
  return jsonResponse(users);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const u = await context.request.json() as any;
  await context.env.DB.prepare(
    'INSERT INTO users (id, name, email, role, loyalty_points, avatar) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(u.id, u.name, u.email, u.role || 'client', u.loyaltyPoints || 0, u.avatar || '').run();
  return jsonResponse(u, 201);
};
