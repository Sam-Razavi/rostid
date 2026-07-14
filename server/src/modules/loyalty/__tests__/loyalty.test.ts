import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { testCustomerId, prisma } from '../../../test/setup';

type LoyaltyPrisma = {
  loyaltyAccount: {
    create: (a: unknown) => Promise<{ id: string; points: number }>;
  };
};

async function loginCustomer() {
  const res = await request(app).post('/api/auth/login').send({
    email: 'customer@test.com',
    password: 'password123',
  });
  return res.body.data.accessToken as string;
}

describe('Loyalty API', () => {
  describe('GET /api/loyalty', () => {
    it('returns zero balance for new user', async () => {
      const token = await loginCustomer();
      const res = await request(app).get('/api/loyalty').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.points).toBe(0);
      expect(res.body.data.lifetimeEarned).toBe(0);
    });

    it('returns account with points when account exists', async () => {
      await (prisma as unknown as LoyaltyPrisma).loyaltyAccount.create({
        data: { userId: testCustomerId, points: 250, lifetimeEarned: 500 },
      });
      const token = await loginCustomer();
      const res = await request(app).get('/api/loyalty').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.points).toBe(250);
    });

    it('requires authentication', async () => {
      const res = await request(app).get('/api/loyalty');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/loyalty/redeem-preview', () => {
    it('returns discountOre for 100 points', async () => {
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/loyalty/redeem-preview')
        .set('Authorization', `Bearer ${token}`)
        .send({ points: 100 });
      expect(res.status).toBe(200);
      expect(res.body.data.discountOre).toBe(1000);
    });

    it('returns discountOre for 250 points (floor to nearest 100)', async () => {
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/loyalty/redeem-preview')
        .set('Authorization', `Bearer ${token}`)
        .send({ points: 250 });
      expect(res.status).toBe(200);
      expect(res.body.data.discountOre).toBe(2000);
    });

    it('returns error for fewer than 100 points', async () => {
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/loyalty/redeem-preview')
        .set('Authorization', `Bearer ${token}`)
        .send({ points: 50 });
      expect(res.status).toBe(500);
    });

    it('requires authentication', async () => {
      const res = await request(app).post('/api/loyalty/redeem-preview').send({ points: 100 });
      expect(res.status).toBe(401);
    });
  });
});
