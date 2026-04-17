import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';

type NewsletterPrisma = {
  newsletterSubscriber: {
    upsert: (a: unknown) => Promise<unknown>;
  };
};

export async function subscribeHandler(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email?: string };
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Valid email is required' });
    return;
  }

  await (prisma as unknown as NewsletterPrisma).newsletterSubscriber.upsert({
    where: { email: email.toLowerCase() },
    create: { email: email.toLowerCase() },
    update: {},
  });

  res.json({ data: null, message: 'Subscribed successfully' });
}
