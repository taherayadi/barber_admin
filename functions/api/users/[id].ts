import { Env, jsonResponse } from '../../_middleware';

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const id = (context.params as any).id;
  const u = await context.request.json() as any;
  await context.env.DB.prepare(
    'UPDATE users SET name=?, email=?, role=?, loyalty_points=?, avatar=? WHERE id=?'
  ).bind(u.name, u.email, u.role, u.loyaltyPoints || 0, u.avatar || '', id).run();
  return jsonResponse({ ok: true });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const id = (context.params as any).id;
  await context.env.DB.prepare('DELETE FROM users WHERE id=?').bind(id).run();
  return jsonResponse({ ok: true });
};
