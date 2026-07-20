import { Env, jsonResponse } from '../../_middleware';

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const id = (context.params as any).id;
  const a = await context.request.json() as any;
  await context.env.DB.prepare(
    'UPDATE appointments SET client_id=?, client_name=?, client_email=?, barber_id=?, barber_name=?, date=?, time=?, service=?, price=?, status=?, points_earned=?, points_redeemed=?, rated=? WHERE id=?'
  ).bind(a.clientId, a.clientName, a.clientEmail, a.barberId, a.barberName, a.date, a.time, JSON.stringify(a.service), a.price, a.status, a.pointsEarned || 0, a.pointsRedeemed || 0, a.rated ? 1 : 0, id).run();
  return jsonResponse({ ok: true });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const id = (context.params as any).id;
  await context.env.DB.prepare('DELETE FROM appointments WHERE id=?').bind(id).run();
  return jsonResponse({ ok: true });
};
