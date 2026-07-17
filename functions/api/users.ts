import { Env, jsonResponse } from '../_middleware';
import { hashPassword } from './_auth';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB.prepare('SELECT * FROM users').all();
  const users = results.map((r: any) => ({
    id: r.id, name: r.name, email: r.email, phone: r.phone || '', role: r.role,
    loyaltyPoints: r.loyalty_points, avatar: r.avatar,
  }));
  return jsonResponse(users);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const u = await context.request.json() as any;
  const passwordHash = u.password ? await hashPassword(u.password) : '';
  await context.env.DB.prepare(
    'INSERT INTO users (id, name, email, phone, role, loyalty_points, avatar, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(u.id, u.name, u.email, u.phone || '', u.role || 'client', u.loyaltyPoints || 0, u.avatar || '', passwordHash).run();
  return jsonResponse({ ...u, password: undefined }, 201);
};
