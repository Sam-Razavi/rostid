import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';

type DiscountPrisma = {
  discountCode: {
    findUnique: (a: unknown) => Promise<{
      id: string; code: string; type: string; value: number;
      minOrderOre: number | null; maxUses: number | null; usedCount: number;
      isActive: boolean; expiresAt: Date | null; createdAt: Date;
    } | null>;
    findMany: (a: unknown) => Promise<unknown[]>;
    create: (a: unknown) => Promise<unknown>;
    delete: (a: unknown) => Promise<unknown>;
    update: (a: unknown) => Promise<unknown>;
  };
};

const db = prisma as unknown as DiscountPrisma;

export async function validateDiscount(code: string, orderTotalOre: number) {
  const discount = await db.discountCode.findUnique({ where: { code: code.toUpperCase() } });

  if (!discount || !discount.isActive) {
    throw AppError.badRequest('Invalid or inactive discount code');
  }

  if (discount.expiresAt && discount.expiresAt < new Date()) {
    throw AppError.badRequest('Discount code has expired');
  }

  if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
    throw AppError.badRequest('Discount code has reached its usage limit');
  }

  if (discount.minOrderOre !== null && orderTotalOre < discount.minOrderOre) {
    throw AppError.badRequest(
      `Minimum order of ${Math.round(discount.minOrderOre / 100)} kr required for this code`
    );
  }

  let discountOre: number;
  if (discount.type === 'percentage') {
    discountOre = Math.round((orderTotalOre * discount.value) / 100);
  } else {
    discountOre = Math.min(discount.value, orderTotalOre);
  }

  return { code: discount.code, type: discount.type, value: discount.value, discountOre };
}

export async function incrementUsedCount(code: string) {
  await db.discountCode.update({
    where: { code: code.toUpperCase() },
    data: { usedCount: { increment: 1 } },
  });
}

export async function listDiscounts() {
  return db.discountCode.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function createDiscount(data: {
  code: string; type: string; value: number;
  minOrderOre?: number; maxUses?: number; expiresAt?: string;
}) {
  return db.discountCode.create({
    data: {
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      minOrderOre: data.minOrderOre ?? null,
      maxUses: data.maxUses ?? null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });
}

export async function deleteDiscount(id: string) {
  await db.discountCode.delete({ where: { id } });
}
