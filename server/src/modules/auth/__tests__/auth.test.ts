import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import app from '../../../app';
import { prisma, testCustomerId } from '../../../test/setup';

type ResetTokenPrisma = {
  passwordResetToken: {
    create: (a: unknown) => Promise<unknown>;
    deleteMany: (a: unknown) => Promise<unknown>;
    findFirst: (a: unknown) => Promise<{ tokenHash: string } | null>;
  };
};
const resetDb = prisma as unknown as ResetTokenPrisma;

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('registers a new user', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'new@test.com',
        password: 'password123',
        name: 'New User',
      });
      expect(res.status).toBe(201);
      expect(res.body.data.user.email).toBe('new@test.com');
      expect(res.body.data.user).not.toHaveProperty('passwordHash');
      expect(res.body.data.accessToken).toBeTruthy();
    });

    it('rejects duplicate email', async () => {
      await request(app).post('/api/auth/register').send({
        email: 'dupe@test.com',
        password: 'password123',
        name: 'First',
      });
      const res = await request(app).post('/api/auth/register').send({
        email: 'dupe@test.com',
        password: 'password123',
        name: 'Second',
      });
      expect(res.status).toBe(409);
    });

    it('validates required fields', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'bad' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'customer@test.com',
        password: 'password123',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeTruthy();
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('rejects wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'customer@test.com',
        password: 'wrongpassword',
      });
      expect(res.status).toBe(401);
    });

    it('rejects unknown email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@test.com',
        password: 'password123',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns current user with valid token', async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'customer@test.com',
        password: 'password123',
      });
      const token = loginRes.body.data.accessToken;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('customer@test.com');
    });

    it('rejects unauthenticated request', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('always returns 200 for known email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'customer@test.com' });
      expect(res.status).toBe(200);
    });

    it('always returns 200 for unknown email (no user enumeration)', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'ghost@nobody.test' });
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ userId: testCustomerId });
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ userId: testCustomerId, token: 'badtoken', password: 'newpassword99' });
      expect(res.status).toBe(400);
    });

    it('resets password with valid token and invalidates refresh tokens', async () => {
      const rawToken = 'validresettoken123';
      const tokenHash = await bcrypt.hash(rawToken, 10);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await resetDb.passwordResetToken.create({
        data: { userId: testCustomerId, tokenHash, expiresAt },
      });

      const loginBefore = await request(app).post('/api/auth/login').send({
        email: 'customer@test.com',
        password: 'password123',
      });
      const refreshCookie = loginBefore.headers['set-cookie'];

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ userId: testCustomerId, token: rawToken, password: 'newpassword456' });
      expect(res.status).toBe(200);

      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', refreshCookie);
      expect(refreshRes.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('clears the refresh token cookie', async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'customer@test.com',
        password: 'password123',
      });
      const cookies = loginRes.headers['set-cookie'];

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookies);
      expect(res.status).toBe(200);
    });
  });
});
