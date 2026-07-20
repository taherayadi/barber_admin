import { Env, jsonResponse } from '../../_middleware';

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const id = (context.params as any).id;
  const n = await context.request.json() as any;
  await context.env.DB.prepare('UPDATE notifications SET read=? WHERE id=?').bind(n.read ? 1 : 0, id).run();
  return jsonResponse({ ok: true });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const id = (context.params as any).id;
  await context.env.DB.prepare('DELETE FROM notifications WHERE id=?').bind(id).run();
  return jsonResponse({ ok: true });
};
