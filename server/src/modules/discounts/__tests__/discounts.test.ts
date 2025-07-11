import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../test/setup';

type DiscountPrisma = {
  discountCode: {
    create: (a: unknown) => Promise<{ id: string; code: string }>;
    deleteMany: (a: unknown) => Promise<unknown>;
  };
};

async function loginCustomer() {
  const res = await request(app).post('/api/auth/login').send({
    email: 'customer@test.com',
    password: 'password123',
  });
  return res.body.data.accessToken as string;
}

async function createTestDiscount(overrides: Record<string, unknown> = {}) {
  return (prisma as unknown as DiscountPrisma).discountCode.create({
    data: {
      code: 'TEST10',
      type: 'percentage',
      value: 10,
      isActive: true,
      usedCount: 0,
      ...overrides,
    },
  });
}

describe('Discounts API', () => {
  describe('POST /api/discounts/validate', () => {
    it('validates a valid percentage discount', async () => {
      await createTestDiscount();
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/discounts/validate')
        .set('Authorization', `Bearer ${token}`)
        .send({ code: 'TEST10', orderTotalOre: 10000 });
      expect(res.status).toBe(200);
      expect(res.body.data.code).toBe('TEST10');
      expect(res.body.data.discountOre).toBe(1000);
    });

    it('validates a fixed discount', async () => {
      await createTestDiscount({ code: 'FIXED500', type: 'fixed', value: 500 });
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/discounts/validate')
        .set('Authorization', `Bearer ${token}`)
        .send({ code: 'FIXED500', orderTotalOre: 10000 });
      expect(res.status).toBe(200);
      expect(res.body.data.discountOre).toBe(500);
    });

    it('returns 400 for unknown code', async () => {
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/discounts/validate')
        .set('Authorization', `Bearer ${token}`)
        .send({ code: 'NOTREAL', orderTotalOre: 10000 });
      expect(res.status).toBe(400);
    });

    it('returns 400 for expired discount', async () => {
      await createTestDiscount({ code: 'EXPIRED', expiresAt: new Date('2020-01-01') });
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/discounts/validate')
        .set('Authorization', `Bearer ${token}`)
        .send({ code: 'EXPIRED', orderTotalOre: 10000 });
      expect(res.status).toBe(400);
    });

    it('returns 400 when min order not met', async () => {
      await createTestDiscount({ code: 'MIN200', minOrderOre: 20000 });
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/discounts/validate')
        .set('Authorization', `Bearer ${token}`)
        .send({ code: 'MIN200', orderTotalOre: 5000 });
      expect(res.status).toBe(400);
    });

    it('returns 400 when usage limit reached', async () => {
      await createTestDiscount({ code: 'MAXED', maxUses: 5, usedCount: 5 });
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/discounts/validate')
        .set('Authorization', `Bearer ${token}`)
        .send({ code: 'MAXED', orderTotalOre: 10000 });
      expect(res.status).toBe(400);
    });

    it('requires authentication', async () => {
      const res = await request(app)
        .post('/api/discounts/validate')
        .send({ code: 'TEST10', orderTotalOre: 10000 });
      expect(res.status).toBe(401);
    });

    it('accepts lowercase code and normalizes to uppercase', async () => {
      await createTestDiscount({ code: 'LOWER10' });
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/discounts/validate')
        .set('Authorization', `Bearer ${token}`)
        .send({ code: 'lower10', orderTotalOre: 10000 });
      expect(res.status).toBe(200);
      expect(res.body.data.code).toBe('LOWER10');
    });

    it('trims whitespace from discount code', async () => {
      await createTestDiscount({ code: 'TRIMMED' });
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/discounts/validate')
        .set('Authorization', `Bearer ${token}`)
        .send({ code: '  TRIMMED  ', orderTotalOre: 10000 });
      expect(res.status).toBe(200);
    });

    it('caps fixed discount at order total', async () => {
      await createTestDiscount({ code: 'BIGDISCOUNT', type: 'fixed', value: 99999 });
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/discounts/validate')
        .set('Authorization', `Bearer ${token}`)
        .send({ code: 'BIGDISCOUNT', orderTotalOre: 5000 });
      expect(res.status).toBe(200);
      expect(res.body.data.discountOre).toBe(5000);
    });
  });
});
