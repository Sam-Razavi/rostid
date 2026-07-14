import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().min(1).max(100).optional(),
      email: z.string().email().optional(),
    })
    .refine((d) => d.name !== undefined || d.email !== undefined, {
      message: 'At least one field (name or email) is required',
    }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
