import { Request, Response } from 'express';
import { registerSchema, loginSchema } from './auth.schema';
import { registerUser, loginUser, refreshTokens, logoutUser, forgotPassword, resetPassword, REFRESH_COOKIE_OPTIONS } from './auth.service';
import { prisma } from '../../config/prisma';

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

export async function me(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.user!.userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  res.json({ data: { user }, message: 'OK' });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.refreshToken as string | undefined;

  if (token) {
    await logoutUser(token);
  }

  res.clearCookie('refreshToken', { path: '/api/auth' });

  res.json({ data: null, message: 'Logged out successfully' });
}

export async function forgotPasswordHandler(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email?: string };
  if (email && typeof email === 'string') {
    await forgotPassword(email).catch(() => undefined);
  }
  // Always 200 to prevent user enumeration
  res.json({ data: null, message: 'If that email exists, a reset link has been sent' });
}

export async function resetPasswordHandler(req: Request, res: Response): Promise<void> {
  const { userId, token, password } = req.body as { userId?: string; token?: string; password?: string };
  if (!userId || !token || !password) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Missing required fields' });
    return;
  }
  await resetPassword(userId, token, password);
  res.json({ data: null, message: 'Password updated successfully' });
}
