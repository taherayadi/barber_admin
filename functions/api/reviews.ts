import { Env, jsonResponse } from '../_middleware';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB.prepare('SELECT * FROM reviews').all();
  const reviews = results.map((r: any) => ({
    id: r.id, barberId: r.barber_id, clientName: r.client_name,
    rating: r.rating, comment: r.comment, date: r.date,
  }));
  return jsonResponse(reviews);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const r = await context.request.json() as any;
  await context.env.DB.prepare(
    'INSERT INTO reviews (id, barber_id, client_name, rating, comment, date) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(r.id, r.barberId, r.clientName, r.rating, r.comment || '', r.date).run();
  return jsonResponse(r, 201);
};
