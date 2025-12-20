import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';

type ReturnRecord = { id: string; orderId: string; userId: string; reason: string; status: string; refundOre: number | null; stripeRefundId: string | null; createdAt: Date };
type ReturnWithItems = ReturnRecord & { items: { id: string; returnId: string; orderItemId: string; quantity: number }[] };
type AdminReturnRecord = ReturnRecord & { items: { id: string; orderItemId: string; quantity: number }[] };

type ReturnPrisma = {
  return: {
    create: (a: unknown) => Promise<ReturnWithItems>;
    findFirst: (a: unknown) => Promise<ReturnRecord | null>;
    findMany: (a: unknown) => Promise<AdminReturnRecord[]>;
    update: (a: unknown) => Promise<ReturnRecord>;
  };
};

const returnDb = prisma as unknown as ReturnPrisma;

export async function submitReturn(
  userId: string,
  orderId: string,
  reason: string,
  items: { orderItemId: string; quantity: number }[]
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.userId !== userId) throw AppError.notFound('Order not found');
  if (order.status !== 'delivered') throw AppError.badRequest('Only delivered orders can be returned');

  const existingReturn = await returnDb.return.findFirst({ where: { orderId, userId } });
  if (existingReturn) throw AppError.badRequest('A return request already exists for this order');

  return returnDb.return.create({
    data: {
      orderId,
      userId,
      reason,
      items: {
        create: items.map((i) => ({ orderItemId: i.orderItemId, quantity: i.quantity })),
      },
    },
    include: { items: true },
  });
}

export async function adminListReturns() {
  return returnDb.return.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });
}

export async function adminUpdateReturn(returnId: string, data: { status: string; refundOre?: number; stripeRefundId?: string }) {
  const ret = await returnDb.return.findFirst({ where: { id: returnId } });
  if (!ret) throw AppError.notFound('Return not found');
  return returnDb.return.update({ where: { id: returnId }, data });
}
