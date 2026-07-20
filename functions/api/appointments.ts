import { Env, jsonResponse } from '../_middleware';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB.prepare('SELECT * FROM appointments').all();
  const apps = results.map((r: any) => ({
    id: r.id, clientId: r.client_id, clientName: r.client_name,
    clientEmail: r.client_email, barberId: r.barber_id, barberName: r.barber_name,
    date: r.date, time: r.time, service: JSON.parse(r.service || '{}'),
    price: r.price, status: r.status, pointsEarned: r.points_earned,
    pointsRedeemed: r.points_redeemed, rated: r.rated === 1,
  }));
  return jsonResponse(apps);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const a = await context.request.json() as any;
  await context.env.DB.prepare(
    'INSERT INTO appointments (id, client_id, client_name, client_email, barber_id, barber_name, date, time, service, price, status, points_earned, points_redeemed, rated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(a.id, a.clientId, a.clientName, a.clientEmail, a.barberId, a.barberName, a.date, a.time, JSON.stringify(a.service), a.price, a.status || 'pending', a.pointsEarned || 0, a.pointsRedeemed || 0, a.rated ? 1 : 0).run();
  return jsonResponse(a, 201);
};
