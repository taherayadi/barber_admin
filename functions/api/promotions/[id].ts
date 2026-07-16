import { Env, jsonResponse } from '../../_middleware';

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const id = (context.params as any).id;
  await context.env.DB.prepare('DELETE FROM promotions WHERE id=?').bind(id).run();
  return jsonResponse({ ok: true });
};
