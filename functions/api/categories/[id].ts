import { Env, jsonResponse } from '../../_middleware';

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const id = (context.params as any).id;
  const db = context.env.DB;
  await db.prepare('DELETE FROM services WHERE category=?').bind(id).run();
  await db.prepare('DELETE FROM categories WHERE id=?').bind(id).run();
  return jsonResponse({ ok: true });
};
