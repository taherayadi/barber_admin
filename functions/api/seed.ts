import { Env, jsonResponse } from '../_middleware';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const db = context.env.DB;

  const count = await db.prepare('SELECT COUNT(*) as c FROM barbers').first<{ c: number }>();
  if (count && count.c > 0) return jsonResponse({ ok: true, seeded: false });

  // No demo/static data is seeded. The application starts empty and is
  // populated through the admin panel (barbers, services, clients, etc.).
  // Only the default loyalty point exchange rate is initialized.
  await db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)`).bind('pointValue', '0.01').run();

  return jsonResponse({ ok: true, seeded: true });
};
