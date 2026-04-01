import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import type { UpdateProfileInput, ChangePasswordInput } from './users.schema';

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  if (data.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== userId) {
      throw AppError.conflict('Email already in use', 'EMAIL_TAKEN');
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
}

export async function changePassword(userId: string, data: ChangePasswordInput) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!valid) {
    throw AppError.badRequest('Current password is incorrect');
  }

  const passwordHash = await bcrypt.hash(data.newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}
