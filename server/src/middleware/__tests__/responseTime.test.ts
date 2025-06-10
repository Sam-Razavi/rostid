import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('X-Response-Time middleware', () => {
  it('adds X-Response-Time header to API responses', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-response-time']).toBeDefined();
  });

  it('X-Response-Time is a numeric millisecond string', async () => {
    const res = await request(app).get('/api/health');
    const header = res.headers['x-response-time'] as string;
    expect(header).toMatch(/^\d+ms$/);
  });

  it('adds X-Response-Time to 404 responses', async () => {
    const res = await request(app).get('/api/nonexistent-route-xyz');
    expect(res.headers['x-response-time']).toBeDefined();
  });

  it('adds X-Response-Time to auth endpoints', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@test.com', password: 'password123' });
    expect(res.headers['x-response-time']).toBeDefined();
  });
});
