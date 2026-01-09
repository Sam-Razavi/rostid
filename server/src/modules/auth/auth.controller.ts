import { Request, Response } from 'express';
import { registerSchema, loginSchema } from './auth.schema';
import { registerUser, loginUser, refreshTokens, logoutUser, REFRESH_COOKIE_OPTIONS } from './auth.service';

export async function register(req: Request, res: Response): Promise<void> {
  const { body } = registerSchema.parse({ body: req.body });
  const result = await registerUser(body);

  res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(201).json({
    data: { user: result.user, accessToken: result.accessToken },
    message: 'Account created successfully',
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { body } = loginSchema.parse({ body: req.body });
  const result = await loginUser(body);

  res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

  res.json({
    data: { user: result.user, accessToken: result.accessToken },
    message: 'Logged in successfully',
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.refreshToken as string | undefined;
  if (!token) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'No refresh token' });
    return;
  }

  const result = await refreshTokens(token);

  res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

  res.json({
    data: { accessToken: result.accessToken },
    message: 'Token refreshed',
  });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.refreshToken as string | undefined;

  if (token) {
    await logoutUser(token);
  }

  res.clearCookie('refreshToken', { path: '/api/auth' });

  res.json({ data: null, message: 'Logged out successfully' });
}
