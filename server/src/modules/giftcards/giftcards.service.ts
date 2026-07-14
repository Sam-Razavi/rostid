import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import crypto from 'crypto';

type GiftCardRecord = {
  id: string;
  code: string;
  balanceOre: number;
  usedOre: number;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
};

type GiftCardPrisma = {
  giftCard: {
    create: (a: unknown) => Promise<GiftCardRecord>;
    findMany: (a: unknown) => Promise<GiftCardRecord[]>;
    findUnique: (a: unknown) => Promise<GiftCardRecord | null>;
    update: (a: unknown) => Promise<GiftCardRecord>;
  };
};

const gcDb = prisma as unknown as GiftCardPrisma;

function generateCode(): string {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
}

export async function adminCreateGiftCard(balanceOre: number, expiresAt?: Date | null) {
  const code = generateCode();
  return gcDb.giftCard.create({ data: { code, balanceOre, expiresAt: expiresAt ?? null } });
}

export async function adminListGiftCards() {
  return gcDb.giftCard.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function validateGiftCard(code: string) {
  const card = await gcDb.giftCard.findUnique({ where: { code } });
  if (!card || !card.isActive) throw AppError.badRequest('Invalid gift card');
  if (card.expiresAt && card.expiresAt < new Date())
    throw AppError.badRequest('Gift card has expired');
  const available = card.balanceOre - card.usedOre;
  if (available <= 0) throw AppError.badRequest('Gift card has no remaining balance');
  return { code: card.code, availableOre: available };
}

export async function useGiftCard(code: string, amountOre: number) {
  const card = await gcDb.giftCard.findUnique({ where: { code } });
  if (!card || !card.isActive) throw AppError.badRequest('Invalid gift card');
  const available = card.balanceOre - card.usedOre;
  const deductOre = Math.min(amountOre, available);
  await gcDb.giftCard.update({ where: { code }, data: { usedOre: { increment: deductOre } } });
  return deductOre;
}
