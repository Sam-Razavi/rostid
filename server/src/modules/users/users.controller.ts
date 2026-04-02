import { Request, Response } from 'express';
import { updateProfileSchema, changePasswordSchema } from './users.schema';
import { updateProfile, changePassword } from './users.service';

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
