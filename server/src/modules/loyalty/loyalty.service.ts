import { prisma } from '../../config/prisma';

type LoyaltyAccountRecord = {
  id: string;
  userId: string;
  points: number;
  lifetimeEarned: number;
  createdAt: Date;
};
type LoyaltyTxRecord = {
  id: string;
  accountId: string;
  orderId: string | null;
  delta: number;
  reason: string;
  createdAt: Date;
};

type LoyaltyPrisma = {
  loyaltyAccount: {
    upsert: (a: unknown) => Promise<LoyaltyAccountRecord>;
    findUnique: (
      a: unknown
    ) => Promise<(LoyaltyAccountRecord & { transactions: LoyaltyTxRecord[] }) | null>;
    update: (a: unknown) => Promise<LoyaltyAccountRecord>;
  };
  loyaltyTransaction: {
    create: (a: unknown) => Promise<LoyaltyTxRecord>;
    findMany: (a: unknown) => Promise<LoyaltyTxRecord[]>;
  };
};

const loyaltyDb = prisma as unknown as LoyaltyPrisma;

export async function earnPoints(userId: string, orderId: string, totalOre: number) {
  const points = Math.floor(totalOre / 1000); // 1 point per 10 kr (1000 öre)
  if (points <= 0) return null;

  const account = await loyaltyDb.loyaltyAccount.upsert({
    where: { userId },
    create: { userId, points, lifetimeEarned: points },
    update: { points: { increment: points }, lifetimeEarned: { increment: points } },
  });

  await loyaltyDb.loyaltyTransaction.create({
    data: { accountId: account.id, orderId, delta: points, reason: 'order_earn' },
  });

  return { points, accountId: account.id };
}

export async function getBalance(userId: string) {
  const account = await loyaltyDb.loyaltyAccount.findUnique({
    where: { userId },
    include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
  });
  return account ?? { points: 0, lifetimeEarned: 0, transactions: [] };
}

export async function redeemPreview(points: number) {
  if (points < 100) throw new Error('Minimum redemption is 100 points');
  const discountOre = Math.floor(points / 100) * 1000; // 100 points = 10 kr (1000 öre)
  return { points, discountOre };
}

export async function redeemPoints(userId: string, points: number, orderId?: string) {
  const account = await loyaltyDb.loyaltyAccount.findUnique({ where: { userId } });
  if (!account || account.points < points) throw new Error('Insufficient points');

  const { discountOre } = await redeemPreview(points);
  const updated = await loyaltyDb.loyaltyAccount.update({
    where: { userId },
    data: { points: { decrement: points } },
  });

  await loyaltyDb.loyaltyTransaction.create({
    data: { accountId: account.id, orderId: orderId ?? null, delta: -points, reason: 'redemption' },
  });

  return { discountOre, remainingPoints: updated.points };
}
