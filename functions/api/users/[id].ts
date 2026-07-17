import { Env, jsonResponse } from '../../_middleware';
import { hashPassword } from '../_auth';

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const id = (context.params as any).id;
  const u = await context.request.json() as any;
  let passwordHash: string | null = null;
  if (u.password) passwordHash = await hashPassword(u.password);
  if (passwordHash) {
    await context.env.DB.prepare(
      'UPDATE users SET name=?, email=?, role=?, loyalty_points=?, avatar=?, password=? WHERE id=?'
    ).bind(u.name, u.email, u.role, u.loyaltyPoints || 0, u.avatar || '', passwordHash, id).run();
  } else {
    await context.env.DB.prepare(
      'UPDATE users SET name=?, email=?, role=?, loyalty_points=?, avatar=? WHERE id=?'
    ).bind(u.name, u.email, u.role, u.loyaltyPoints || 0, u.avatar || '', id).run();
  }
  return jsonResponse({ ok: true });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const id = (context.params as any).id;
  await context.env.DB.prepare('DELETE FROM users WHERE id=?').bind(id).run();
  return jsonResponse({ ok: true });
};
