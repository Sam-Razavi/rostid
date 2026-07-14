import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../test/setup';

type ShippingPrisma = {
  shippingRate: {
    create: (a: unknown) => Promise<{ id: string }>;
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

async function createShippingRate(overrides: Record<string, unknown> = {}) {
  return (prisma as unknown as ShippingPrisma).shippingRate.create({
    data: {
      name: 'Standard Delivery',
      priceOre: 4900,
      freeThresholdOre: 50000,
      estimatedDays: '3-5',
      isActive: true,
      ...overrides,
    },
  });
}

describe('Shipping API', () => {
  describe('GET /api/shipping/rates', () => {
    it('returns shipping rates', async () => {
      await createShippingRate();
      const res = await request(app).get('/api/shipping/rates');
      expect(res.status).toBe(200);
      expect(res.body.data.rates).toBeInstanceOf(Array);
      expect(res.body.data.rates.length).toBeGreaterThanOrEqual(1);
    });

    it('marks rate as free when totalOre meets threshold', async () => {
      await createShippingRate({ freeThresholdOre: 10000 });
      const res = await request(app).get('/api/shipping/rates?totalOre=10000');
      expect(res.status).toBe(200);
      const freeRate = res.body.data.rates.find((r: { isFree: boolean }) => r.isFree);
      expect(freeRate).toBeDefined();
      expect(freeRate.effectivePriceOre).toBe(0);
    });

    it('does not mark rate as free below threshold', async () => {
      await createShippingRate({ freeThresholdOre: 50000 });
      const res = await request(app).get('/api/shipping/rates?totalOre=20000');
      expect(res.status).toBe(200);
      const rate = res.body.data.rates[0];
      expect(rate.isFree).toBe(false);
      expect(rate.effectivePriceOre).toBe(rate.priceOre);
    });
  });

  describe('GET /api/shipping/addresses', () => {
    it('returns empty address list for new user', async () => {
      const token = await loginCustomer();
      const res = await request(app)
        .get('/api/shipping/addresses')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.addresses).toEqual([]);
    });

    it('requires authentication', async () => {
      const res = await request(app).get('/api/shipping/addresses');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/shipping/addresses', () => {
    it('creates a shipping address', async () => {
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/shipping/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Home',
          line1: 'Storgatan 1',
          city: 'Stockholm',
          postalCode: '11122',
          country: 'SE',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.address.city).toBe('Stockholm');
    });

    it('sets default flag when isDefault is true', async () => {
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/shipping/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Work',
          line1: 'Kungsgatan 5',
          city: 'Stockholm',
          postalCode: '11143',
          isDefault: true,
        });
      expect(res.status).toBe(201);
      expect(res.body.data.address.isDefault).toBe(true);
    });
  });

  describe('DELETE /api/shipping/addresses/:id', () => {
    it('deletes a shipping address', async () => {
      const token = await loginCustomer();
      const createRes = await request(app)
        .post('/api/shipping/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'To Delete', line1: 'Vägen 3', city: 'Göteborg', postalCode: '40000' });
      const addressId = createRes.body.data.address.id;

      const res = await request(app)
        .delete(`/api/shipping/addresses/${addressId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it("returns 404 when deleting another user's address", async () => {
      const customerToken = await loginCustomer();
      const createRes = await request(app)
        .post('/api/shipping/addresses')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ name: 'Mine', line1: 'Hej 1', city: 'Malmö', postalCode: '21100' });
      const addressId = createRes.body.data.address.id;

      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'password123' });
      const adminTok = adminLogin.body.data.accessToken;

      const res = await request(app)
        .delete(`/api/shipping/addresses/${addressId}`)
        .set('Authorization', `Bearer ${adminTok}`);
      expect(res.status).toBe(404);
    });
  });
});
