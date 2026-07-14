import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { adminCreateGiftCard } from '../giftcards.service';

async function adminToken() {
  const res = await request(app).post('/api/auth/login').send({
    email: 'admin@test.com',
    password: 'password123',
  });
  return res.body.data.accessToken as string;
}

describe('Gift Cards API', () => {
  describe('POST /api/giftcards/validate', () => {
    it('validates a valid gift card', async () => {
      const card = await adminCreateGiftCard(5000);
      const res = await request(app).post('/api/giftcards/validate').send({ code: card.code });
      expect(res.status).toBe(200);
      expect(res.body.data.availableOre).toBe(5000);
      expect(res.body.data.code).toBe(card.code);
    });

    it('returns 400 for unknown gift card code', async () => {
      const res = await request(app).post('/api/giftcards/validate').send({ code: 'DOESNOTEXIST' });
      expect(res.status).toBe(400);
    });

    it('returns 400 for expired gift card', async () => {
      const card = await adminCreateGiftCard(5000, new Date('2020-01-01'));
      const res = await request(app).post('/api/giftcards/validate').send({ code: card.code });
      expect(res.status).toBe(400);
    });

    it('returns 400 when balance is fully used', async () => {
      const card = await adminCreateGiftCard(1000);
      const { useGiftCard } = await import('../giftcards.service');
      await useGiftCard(card.code, 1000);
      const res = await request(app).post('/api/giftcards/validate').send({ code: card.code });
      expect(res.status).toBe(400);
    });

    it('is case-insensitive for code lookup', async () => {
      const card = await adminCreateGiftCard(2500);
      const res = await request(app)
        .post('/api/giftcards/validate')
        .send({ code: card.code.toLowerCase() });
      expect(res.status).toBe(200);
    });
  });

  describe('Admin gift card endpoints', () => {
    it('admin can create a gift card', async () => {
      const token = await adminToken();
      const res = await request(app)
        .post('/api/admin/giftcards')
        .set('Authorization', `Bearer ${token}`)
        .send({ balanceOre: 10000 });
      expect(res.status).toBe(201);
      expect(res.body.data.card.balanceOre).toBe(10000);
    });

    it('admin can list gift cards', async () => {
      await adminCreateGiftCard(1000);
      const token = await adminToken();
      const res = await request(app)
        .get('/api/admin/giftcards')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.cards).toBeInstanceOf(Array);
      expect(res.body.data.cards.length).toBeGreaterThanOrEqual(1);
    });

    it('blocks unauthenticated access to admin gift cards', async () => {
      const res = await request(app).get('/api/admin/giftcards');
      expect(res.status).toBe(401);
    });
  });
});
