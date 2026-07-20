import { Env, jsonResponse } from '../../_middleware';

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const id = (context.params as any).id;
  await context.env.DB.prepare('DELETE FROM promotions WHERE id=?').bind(id).run();
  return jsonResponse({ ok: true });
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const id = (context.params as any).id;
  const p = await context.request.json() as any;
  await context.env.DB.prepare(
    'UPDATE promotions SET title = ?, description = ?, image = ?, discount = ?, start_date = ?, end_date = ?, booking_limit = ?, bookings_count = ?, active = ? WHERE id = ?'
  ).bind(
    p.title, p.description || '', p.image || '', p.discount || '',
    p.startDate, p.endDate, p.bookingLimit || 0, p.bookingsCount || 0,
    p.active ? 1 : 0, id
  ).run();
  return jsonResponse(p);
};

