import { Request, Response } from 'express';
import { updateProfileSchema } from './users.schema';
import { updateProfile } from './users.service';

export async function updateProfileHandler(req: Request, res: Response): Promise<void> {
  const { body } = updateProfileSchema.parse({ body: req.body });
  const user = await updateProfile(req.user!.userId, body);
  res.json({ data: { user }, message: 'Profile updated' });
}
