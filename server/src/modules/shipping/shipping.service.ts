import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';

type AddressPrisma = {
  shippingAddress: {
    findMany: (a: unknown) => Promise<unknown[]>;
    findFirst: (a: unknown) => Promise<unknown | null>;
    create: (a: unknown) => Promise<unknown>;
    update: (a: unknown) => Promise<unknown>;
    updateMany: (a: unknown) => Promise<unknown>;
    delete: (a: unknown) => Promise<unknown>;
  };
  shippingRate: {
    findMany: (a: unknown) => Promise<unknown[]>;
  };
};

const db = prisma as unknown as AddressPrisma;

export async function listAddresses(userId: string) {
  return db.shippingAddress.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });
}

export async function createAddress(userId: string, data: {
  name: string; line1: string; line2?: string | null;
  city: string; postalCode: string; country?: string; isDefault?: boolean;
}) {
  if (data.isDefault) {
    await db.shippingAddress.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  return db.shippingAddress.create({ data: { ...data, userId } });
}

export async function updateAddress(userId: string, addressId: string, data: {
  name?: string; line1?: string; line2?: string | null;
  city?: string; postalCode?: string; country?: string; isDefault?: boolean;
}) {
  const address = await db.shippingAddress.findFirst({ where: { id: addressId, userId } });
  if (!address) throw AppError.notFound('Address not found');

  if (data.isDefault) {
    await db.shippingAddress.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  return db.shippingAddress.update({ where: { id: addressId }, data });
}

export async function deleteAddress(userId: string, addressId: string) {
  const address = await db.shippingAddress.findFirst({ where: { id: addressId, userId } });
  if (!address) throw AppError.notFound('Address not found');
  return db.shippingAddress.delete({ where: { id: addressId } });
}

export async function listShippingRates(totalOre: number) {
  const rates = await db.shippingRate.findMany({ where: { isActive: true } }) as Array<{
    id: string; name: string; priceOre: number; freeThresholdOre: number | null; estimatedDays: string | null; isActive: boolean;
  }>;

  return rates.map((rate) => ({
    ...rate,
    effectivePriceOre: rate.freeThresholdOre && totalOre >= rate.freeThresholdOre ? 0 : rate.priceOre,
    isFree: !!(rate.freeThresholdOre && totalOre >= rate.freeThresholdOre),
  }));
}
