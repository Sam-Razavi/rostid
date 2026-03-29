import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { signAccessToken, signRefreshToken } from '../../utils/jwt';
import { env } from '../../config/env';
import { sendWelcomeEmail } from '../../utils/emails/welcome';
import { sendPasswordResetEmail } from '../../utils/emails/passwordReset';
import type { RegisterInput, LoginInput } from './auth.schema';

export async function registerUser(data: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw AppError.conflict('Email already in use', 'EMAIL_TAKEN');
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { token: refreshToken } = await prisma.refreshToken.create({
    data: {
      token: crypto.randomUUID(),
      userId: user.id,
      expiresAt,
    },
  });

  const signedRefresh = signRefreshToken({ userId: user.id, tokenId: refreshToken });

  // Fire-and-forget welcome email
  sendWelcomeEmail(user.email, user.name).catch((err) =>
    console.error('[email] welcome failed:', err)
  );

  return { user, accessToken, refreshToken: signedRefresh };
}

export async function loginUser(data: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const refreshTokenRecord = await prisma.refreshToken.create({
    data: {
      token: crypto.randomUUID(),
      userId: user.id,
      expiresAt,
    },
  });

  const signedRefresh = signRefreshToken({
    userId: user.id,
    tokenId: refreshTokenRecord.token,
  });

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    accessToken,
    refreshToken: signedRefresh,
  };
}

export async function refreshTokens(rawCookieToken: string) {
  const { verifyRefreshToken } = await import('../../utils/jwt');

  let payload: { userId: string; tokenId: string };
  try {
    payload = verifyRefreshToken(rawCookieToken);
  } catch {
    throw AppError.unauthorized('Invalid refresh token');
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: payload.tokenId },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw AppError.unauthorized('Refresh token expired or revoked');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    throw AppError.unauthorized('User not found');
  }

  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const newToken = await prisma.refreshToken.create({
    data: {
      token: crypto.randomUUID(),
      userId: user.id,
      expiresAt,
    },
  });

  const newRefreshToken = signRefreshToken({ userId: user.id, tokenId: newToken.token });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logoutUser(rawCookieToken: string) {
  try {
    const { verifyRefreshToken } = await import('../../utils/jwt');
    const payload = verifyRefreshToken(rawCookieToken);
    await prisma.refreshToken.deleteMany({ where: { token: payload.tokenId } });
  } catch {
    // Token already invalid — no action needed
  }
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always return success to avoid user enumeration
  if (!user) return;

  const rawToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const tokenHash = await bcrypt.hash(rawToken, 10);

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await (prisma as unknown as { passwordResetToken: { deleteMany: (a: unknown) => Promise<unknown>; create: (a: unknown) => Promise<unknown>; findFirst: (a: unknown) => Promise<{ tokenHash: string } | null> } }).passwordResetToken.deleteMany({ where: { userId: user.id } });
  await (prisma as unknown as { passwordResetToken: { deleteMany: (a: unknown) => Promise<unknown>; create: (a: unknown) => Promise<unknown>; findFirst: (a: unknown) => Promise<{ tokenHash: string } | null> } }).passwordResetToken.create({ data: { tokenHash, userId: user.id, expiresAt } });

  const resetUrl = `${process.env.CLIENT_URL ?? 'http://localhost:5173'}/reset-password?token=${rawToken}&uid=${user.id}`;
  await sendPasswordResetEmail(email, resetUrl);
}

export async function resetPassword(userId: string, rawToken: string, newPassword: string) {
  const record = await (prisma as unknown as { passwordResetToken: { deleteMany: (a: unknown) => Promise<unknown>; create: (a: unknown) => Promise<unknown>; findFirst: (a: unknown) => Promise<{ tokenHash: string } | null> } }).passwordResetToken.findFirst({
    where: { userId, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) throw AppError.badRequest('Invalid or expired reset link');

  const valid = await bcrypt.compare(rawToken, record.tokenHash);
  if (!valid) throw AppError.badRequest('Invalid or expired reset link');

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  await (prisma as unknown as { passwordResetToken: { deleteMany: (a: unknown) => Promise<unknown>; create: (a: unknown) => Promise<unknown>; findFirst: (a: unknown) => Promise<{ tokenHash: string } | null> } }).passwordResetToken.deleteMany({ where: { userId } });
}

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};
