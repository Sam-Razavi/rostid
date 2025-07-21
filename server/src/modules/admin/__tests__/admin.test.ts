import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { testCategoryId, testProductId } from '../../../test/setup';

async function adminToken() {
  const res = await request(app).post('/api/auth/login').send({
    email: 'admin@test.com',
    password: 'password123',
  });
  return res.body.data.accessToken as string;
}

async function customerToken() {
  const res = await request(app).post('/api/auth/login').send({
    email: 'customer@test.com',
    password: 'password123',
  });
  return res.body.data.accessToken as string;
}

describe('Admin API', () => {
  describe('Authorization', () => {
    it('blocks unauthenticated requests', async () => {
      const res = await request(app).get('/api/admin/stats');
      expect(res.status).toBe(401);
    });

    it('blocks customer role', async () => {
      const token = await customerToken();
      const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/admin/stats', () => {
    it('returns dashboard stats', async () => {
      const token = await adminToken();
      const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('totalOrders');
      expect(res.body.data).toHaveProperty('totalRevenueOre');
      expect(res.body.data).toHaveProperty('totalProducts');
      expect(res.body.data).toHaveProperty('totalCustomers');
    });
  });

  describe('Product management', () => {
    it('creates a product', async () => {
      const token = await adminToken();
      const res = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Admin Product',
          slug: 'admin-product',
          description: 'Created by admin',
          priceOre: 19900,
          stock: 25,
          categoryId: testCategoryId,
        });
      expect(res.status).toBe(201);
      expect(res.body.data.product.name).toBe('Admin Product');
    });

    it('updates a product', async () => {
      const token = await adminToken();
      const res = await request(app)
        .patch(`/api/admin/products/${testProductId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ stock: 99 });
      expect(res.status).toBe(200);
      expect(res.body.data.product.stock).toBe(99);
    });

    it('deletes a product', async () => {
      const token = await adminToken();
      // Create a product to delete
      const created = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'To Delete',
          slug: 'to-delete',
          description: 'Will be deleted',
          priceOre: 100,
          stock: 1,
          categoryId: testCategoryId,
        });
      const id = created.body.data.product.id;
      const res = await request(app)
        .delete(`/api/admin/products/${id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });

  describe('Order management', () => {
    it('lists all orders', async () => {
      const token = await adminToken();
      const res = await request(app).get('/api/admin/orders').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.orders).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/admin/products/bulk', () => {
    it('deactivates products in bulk', async () => {
      const token = await adminToken();
      const res = await request(app)
        .post('/api/admin/products/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [testProductId], action: 'deactivate' });
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deactivat/i);
    });

    it('activates products in bulk', async () => {
      const token = await adminToken();
      const res = await request(app)
        .post('/api/admin/products/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [testProductId], action: 'activate' });
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/activat/i);
    });

    it('returns 400 for empty ids array', async () => {
      const token = await adminToken();
      const res = await request(app)
        .post('/api/admin/products/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [], action: 'activate' });
      expect(res.status).toBe(400);
    });

    it('returns 400 for unknown action', async () => {
      const token = await adminToken();
      const res = await request(app)
        .post('/api/admin/products/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [testProductId], action: 'delete' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/admin/stats/revenue', () => {
    it('returns revenue time series with default granularity', async () => {
      const token = await adminToken();
      const res = await request(app)
        .get('/api/admin/stats/revenue')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('accepts daily granularity param', async () => {
      const token = await adminToken();
      const res = await request(app)
        .get('/api/admin/stats/revenue?granularity=daily')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('accepts monthly granularity param', async () => {
      const token = await adminToken();
      const res = await request(app)
        .get('/api/admin/stats/revenue?granularity=monthly')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('accepts from/to date range params', async () => {
      const token = await adminToken();
      const res = await request(app)
        .get('/api/admin/stats/revenue?granularity=daily&from=2025-01-01&to=2025-12-31')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });
});
