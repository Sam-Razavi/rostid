import { Request, Response } from 'express';
import { registerSchema, loginSchema } from './auth.schema';
import { registerUser, loginUser, REFRESH_COOKIE_OPTIONS } from './auth.service';

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
