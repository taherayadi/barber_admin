import { Env, jsonResponse, errorResponse } from '../_middleware';
import { verifyPassword } from './_auth';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { email, password } = await context.request.json() as any;
  if (!email || !password) {
    return errorResponse('Email and password are required', 400);
  }
  const row = await context.env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first<any>();
  if (!row) {
    return errorResponse('Invalid credentials', 401);
  }
  if (!row.password || !(await verifyPassword(password, row.password))) {
    return errorResponse('Invalid credentials', 401);
  }
  const user = {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    loyaltyPoints: row.loyalty_points,
    avatar: row.avatar,
  };
  return jsonResponse(user, 200);
};
