import { Env, jsonResponse } from '../_middleware';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const row = await context.env.DB.prepare('SELECT value FROM settings WHERE key=?').bind('pointValue').first<{ value: string }>();
  return jsonResponse({ pointValue: row ? parseFloat(row.value) : 0.01 });
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { pointValue } = await context.request.json() as { pointValue: number };
  await context.env.DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').bind('pointValue', pointValue.toString()).run();
  return jsonResponse({ ok: true });
};
