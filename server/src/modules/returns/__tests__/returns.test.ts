import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { prisma, testCustomerId, testAdminId, testProductId } from '../../../test/setup';

async function loginCustomer() {
  const res = await request(app).post('/api/auth/login').send({
    email: 'customer@test.com',
    password: 'password123',
  });
  return res.body.data.accessToken as string;
}

async function createDeliveredOrder(userId: string, fulfilledAt: Date = new Date()) {
  return prisma.order.create({
    data: {
      userId,
      status: 'delivered',
      subtotalOre: 12900,
      totalOre: 12900,
      fulfilledAt,
      items: {
        create: [{ productId: testProductId, quantity: 1, unitPriceOre: 12900 }],
      },
    },
    include: { items: true },
  });
}

describe('Returns API', () => {
  describe('POST /api/orders/:id/return', () => {
    it('submits a return for a delivered order', async () => {
      const token = await loginCustomer();
      const order = await createDeliveredOrder(testCustomerId);

      const res = await request(app)
        .post(`/api/orders/${order.id}/return`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'damaged', items: [{ orderItemId: order.items[0].id, quantity: 1 }] });

      expect(res.status).toBe(201);
      expect(res.body.data.reason).toBe('damaged');
      expect(res.body.data.items).toHaveLength(1);
    });

    it('rejects return for non-delivered order', async () => {
      const token = await loginCustomer();
      const order = await prisma.order.create({
        data: {
          userId: testCustomerId,
          status: 'confirmed',
          subtotalOre: 12900,
          totalOre: 12900,
          items: { create: [{ productId: testProductId, quantity: 1, unitPriceOre: 12900 }] },
        },
        include: { items: true },
      });

      const res = await request(app)
        .post(`/api/orders/${order.id}/return`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'damaged', items: [{ orderItemId: order.items[0].id, quantity: 1 }] });

      expect(res.status).toBe(400);
    });

    it('rejects return submitted outside 30-day window', async () => {
      const token = await loginCustomer();
      const pastDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
      const order = await createDeliveredOrder(testCustomerId, pastDate);

      const res = await request(app)
        .post(`/api/orders/${order.id}/return`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'changed_mind', items: [{ orderItemId: order.items[0].id, quantity: 1 }] });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/30 days/i);
    });

    it('rejects duplicate return request for same order', async () => {
      const token = await loginCustomer();
      const order = await createDeliveredOrder(testCustomerId);
      const payload = { reason: 'damaged', items: [{ orderItemId: order.items[0].id, quantity: 1 }] };

      await request(app)
        .post(`/api/orders/${order.id}/return`)
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      const res = await request(app)
        .post(`/api/orders/${order.id}/return`)
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(400);
    });

    it('returns 404 for another user\'s order', async () => {
      const token = await loginCustomer();
      const order = await createDeliveredOrder(testAdminId);

      const res = await request(app)
        .post(`/api/orders/${order.id}/return`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'damaged', items: [{ orderItemId: order.items[0].id, quantity: 1 }] });

      expect(res.status).toBe(404);
    });

    it('requires authentication', async () => {
      const res = await request(app)
        .post('/api/orders/fake-id/return')
        .send({ reason: 'damaged', items: [] });
      expect(res.status).toBe(401);
    });
  });
});
