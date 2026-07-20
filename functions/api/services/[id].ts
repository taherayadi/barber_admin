import { Env, jsonResponse } from '../../_middleware';

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const id = (context.params as any).id;
  await context.env.DB.prepare('DELETE FROM services WHERE id=?').bind(id).run();
  return jsonResponse({ ok: true });
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const id = (context.params as any).id;
  const s = await context.request.json() as any;
  await context.env.DB.prepare(
    'UPDATE services SET name=?, price=?, duration=?, points_given=?, points_cost=?, description=?, category=?, barbers_allowed=? WHERE id=?'
  ).bind(
    s.name, s.price, s.duration, s.pointsGiven || 0, s.pointsCost || 0,
    s.description || '', s.category || '', JSON.stringify(s.barbersAllowed || []), id
  ).run();
  return jsonResponse(s);
};
