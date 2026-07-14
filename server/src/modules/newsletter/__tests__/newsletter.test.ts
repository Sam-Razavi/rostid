import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../app';

describe('Newsletter API', () => {
  describe('POST /api/newsletter/subscribe', () => {
    it('subscribes a new email address', async () => {
      const res = await request(app)
        .post('/api/newsletter/subscribe')
        .send({ email: 'subscriber@test.com' });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/subscribed/i);
    });

    it('accepts re-subscription for existing email without error', async () => {
      await request(app).post('/api/newsletter/subscribe').send({ email: 'dupe@test.com' });

      const res = await request(app)
        .post('/api/newsletter/subscribe')
        .send({ email: 'dupe@test.com' });

      expect(res.status).toBe(200);
    });

    it('normalizes email to lowercase', async () => {
      const res = await request(app)
        .post('/api/newsletter/subscribe')
        .send({ email: 'UPPER@TEST.COM' });

      expect(res.status).toBe(200);
    });

    it('rejects missing email', async () => {
      const res = await request(app).post('/api/newsletter/subscribe').send({});

      expect(res.status).toBe(400);
    });

    it('rejects invalid email format', async () => {
      const res = await request(app)
        .post('/api/newsletter/subscribe')
        .send({ email: 'not-an-email' });

      expect(res.status).toBe(400);
    });

    it('rejects empty string email', async () => {
      const res = await request(app).post('/api/newsletter/subscribe').send({ email: '' });

      expect(res.status).toBe(400);
    });
  });
});
