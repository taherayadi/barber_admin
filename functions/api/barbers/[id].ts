import { Env, jsonResponse, errorResponse } from '../../_middleware';

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const id = (context.params as any).id;
  const b = await context.request.json() as any;
  await context.env.DB.prepare(
    'UPDATE barbers SET name=?, specialty=?, rating=?, reviews_count=?, avatar=?, bio=?, available_times=?, services_allowed=? WHERE id=?'
  ).bind(b.name, b.specialty || '', b.rating || 5.0, b.reviewsCount || 0, b.avatar || '', b.bio || '', JSON.stringify(b.availableTimes || []), b.servicesAllowed ? JSON.stringify(b.servicesAllowed) : null, id).run();
  return jsonResponse({ ok: true });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const id = (context.params as any).id;
  await context.env.DB.prepare('DELETE FROM barbers WHERE id=?').bind(id).run();
  return jsonResponse({ ok: true });
};
