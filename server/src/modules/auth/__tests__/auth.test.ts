import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../app';

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
