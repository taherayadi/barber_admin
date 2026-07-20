import { Env, jsonResponse } from '../_middleware';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB.prepare('SELECT * FROM categories').all();
  const cats = results.map((r: any) => ({
    id: r.id, name: r.name, description: r.description,
    bgClass: r.bg_class, fillClass: r.fill_class, textClass: r.text_class,
  }));
  return jsonResponse(cats);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const c = await context.request.json() as any;
  await context.env.DB.prepare(
    'INSERT INTO categories (id, name, description, bg_class, fill_class, text_class) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(c.id, c.name, c.description || '', c.bgClass || '', c.fillClass || '', c.textClass || '').run();
  return jsonResponse(c, 201);
};
