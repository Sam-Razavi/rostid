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
      expect(
        res.body.data.products.every(
          (p: { category: { slug: string } }) => p.category.slug === 'test-category'
        )
      ).toBe(true);
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

    it('filters by minPrice', async () => {
      await prisma.product.create({
        data: {
          name: 'Cheap Coffee',
          slug: 'cheap-coffee',
          description: 'Budget option',
          priceOre: 4900,
          stock: 5,
          categoryId: testCategoryId,
        },
      });
      const res = await request(app).get('/api/products?minPrice=10000');
      expect(res.status).toBe(200);
      expect(res.body.data.products.every((p: { priceOre: number }) => p.priceOre >= 10000)).toBe(
        true
      );
    });

    it('filters by maxPrice', async () => {
      const res = await request(app).get('/api/products?maxPrice=10000');
      expect(res.status).toBe(200);
      expect(res.body.data.products.every((p: { priceOre: number }) => p.priceOre <= 10000)).toBe(
        true
      );
    });

    it('sorts by price ascending', async () => {
      await prisma.product.create({
        data: {
          name: 'Premium Coffee',
          slug: 'premium-coffee',
          description: 'Premium',
          priceOre: 29900,
          stock: 5,
          categoryId: testCategoryId,
        },
      });
      const res = await request(app).get('/api/products?sort=price_asc');
      expect(res.status).toBe(200);
      const prices = res.body.data.products.map((p: { priceOre: number }) => p.priceOre);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it('sorts by price descending', async () => {
      const res = await request(app).get('/api/products?sort=price_desc');
      expect(res.status).toBe(200);
      const prices = res.body.data.products.map((p: { priceOre: number }) => p.priceOre);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });

    it('supports multi-word search', async () => {
      const res = await request(app).get('/api/products?search=Test+Coffee');
      expect(res.status).toBe(200);
      expect(res.body.data.products.length).toBeGreaterThanOrEqual(1);
    });

    it('returns pagination total in response', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.data.pagination).toHaveProperty('total');
      expect(typeof res.body.data.pagination.total).toBe('number');
      expect(res.body.data.pagination.total).toBeGreaterThanOrEqual(1);
    });

    it('total matches products count when no filters applied', async () => {
      const res = await request(app).get('/api/products?limit=100');
      expect(res.status).toBe(200);
      expect(res.body.data.pagination.total).toBe(res.body.data.products.length);
    });

    it('inStock=true filters out products with stock 0', async () => {
      await prisma.product.create({
        data: {
          name: 'Out of Stock Coffee',
          slug: 'out-of-stock-coffee',
          description: 'Gone',
          priceOre: 9900,
          stock: 0,
          categoryId: testCategoryId,
        },
      });
      const res = await request(app).get('/api/products?inStock=true');
      expect(res.status).toBe(200);
      expect(res.body.data.products.every((p: { stock: number }) => p.stock > 0)).toBe(true);
    });

    it('without inStock filter shows all products including out-of-stock', async () => {
      await prisma.product.create({
        data: {
          name: 'Out of Stock Coffee 2',
          slug: 'out-of-stock-coffee-2',
          description: 'Gone',
          priceOre: 9900,
          stock: 0,
          categoryId: testCategoryId,
        },
      });
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      const stocks = res.body.data.products.map((p: { stock: number }) => p.stock);
      expect(stocks.some((s: number) => s === 0)).toBe(true);
    });

    it('category filter returns only matching products', async () => {
      await prisma.category
        .create({ data: { name: 'Espresso', slug: 'espresso', description: 'Espresso beans' } })
        .then(async (cat) => {
          await prisma.product.create({
            data: {
              name: 'Espresso Blend',
              slug: 'espresso-blend',
              description: 'Bold',
              priceOre: 14900,
              stock: 20,
              categoryId: cat.id,
            },
          });
        });
      const res = await request(app).get('/api/products?category=test-category');
      expect(res.status).toBe(200);
      expect(
        res.body.data.products.every(
          (p: { category: { slug: string } }) => p.category.slug === 'test-category'
        )
      ).toBe(true);
    });
  });

  describe('GET /api/products/:slug', () => {
    it('returns product by slug', async () => {
      const res = await request(app).get(`/api/products/${testProductSlug}`);
      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe(testProductSlug);
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
      expect(res.body.data.slug).toBe('new-product');
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
