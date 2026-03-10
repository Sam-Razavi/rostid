import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { testProductSlug, testCategoryId, prisma } from '../../../test/setup';

describe('Products API', () => {
  describe('GET /api/products', () => {
    it('returns a list of products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.data.products).toBeInstanceOf(Array);
      expect(res.body.data.products.length).toBeGreaterThanOrEqual(1);
    });

    it('supports limit param', async () => {
      const res = await request(app).get('/api/products?limit=1');
      expect(res.status).toBe(200);
      expect(res.body.data.products.length).toBeLessThanOrEqual(1);
    });

    it('supports category filter', async () => {
      const res = await request(app).get('/api/products?category=test-category');
      expect(res.status).toBe(200);
      expect(res.body.data.products.every((p: { category: { slug: string } }) => p.category.slug === 'test-category')).toBe(true);
    });

    it('supports search filter', async () => {
      const res = await request(app).get('/api/products?search=Test');
      expect(res.status).toBe(200);
      expect(res.body.data.products.length).toBeGreaterThanOrEqual(1);
    });

    it('supports exclude param', async () => {
      const allRes = await request(app).get('/api/products');
      const productId = allRes.body.data.products[0].id;
      const res = await request(app).get(`/api/products?exclude=${productId}`);
      expect(res.body.data.products.every((p: { id: string }) => p.id !== productId)).toBe(true);
    });
  });

  describe('GET /api/products/:slug', () => {
    it('returns product by slug', async () => {
      const res = await request(app).get(`/api/products/${testProductSlug}`);
      expect(res.status).toBe(200);
      expect(res.body.data.product.slug).toBe(testProductSlug);
    });

    it('returns 404 for unknown slug', async () => {
      const res = await request(app).get('/api/products/does-not-exist');
      expect(res.status).toBe(404);
    });
  });

  describe('Admin product CRUD', () => {
    async function adminToken() {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@test.com',
        password: 'password123',
      });
      return res.body.data.accessToken as string;
    }

    it('admin can create a product', async () => {
      const token = await adminToken();
      const res = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Product',
          slug: 'new-product',
          description: 'Desc',
          priceOre: 9900,
          stock: 10,
          categoryId: testCategoryId,
        });
      expect(res.status).toBe(201);
      expect(res.body.data.product.slug).toBe('new-product');
    });

    it('customer cannot create a product', async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'customer@test.com',
        password: 'password123',
      });
      const token = loginRes.body.data.accessToken;
      const res = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'x', slug: 'x', priceOre: 100, stock: 1, categoryId: testCategoryId });
      expect(res.status).toBe(403);
    });
  });
});
