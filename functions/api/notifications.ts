import { Env, jsonResponse } from '../_middleware';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB.prepare('SELECT * FROM notifications ORDER BY date DESC').all();
  const notifs = results.map((r: any) => ({
    id: r.id, clientId: r.client_id, title: r.title, message: r.message,
    date: r.date, read: r.read === 1, type: r.type,
  }));
  return jsonResponse(notifs);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const n = await context.request.json() as any;
  await context.env.DB.prepare(
    'INSERT INTO notifications (id, client_id, title, message, date, read, type) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(n.id, n.clientId, n.title, n.message, n.date, n.read ? 1 : 0, n.type || 'system').run();
  return jsonResponse(n, 201);
};
