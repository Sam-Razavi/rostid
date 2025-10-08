import { Request, Response } from 'express';
import { updateProfileSchema, changePasswordSchema } from './users.schema';
import { updateProfile, changePassword, deleteAccount } from './users.service';

export async function updateProfileHandler(req: Request, res: Response): Promise<void> {
  const { body } = updateProfileSchema.parse({ body: req.body });
  const user = await updateProfile(req.user!.userId, body);
  res.json({ data: { user }, message: 'Profile updated' });
}

export async function changePasswordHandler(req: Request, res: Response): Promise<void> {
  const { body } = changePasswordSchema.parse({ body: req.body });
  await changePassword(req.user!.userId, body);
  res.json({ data: null, message: 'Password changed successfully' });
}

export async function deleteAccountHandler(req: Request, res: Response): Promise<void> {
  await deleteAccount(req.user!.userId);
  res.clearCookie('refreshToken');
  res.status(204).send();
}
