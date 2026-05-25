import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../test/setup';

describe('Categories API', () => {
  describe('GET /api/categories', () => {
    it('returns list of categories', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('includes category with seeded slug', async () => {
      const res = await request(app).get('/api/categories');
      const slugs = res.body.data.map((c: { slug: string }) => c.slug);
      expect(slugs).toContain('test-category');
    });

    it('returns categories with id, name and slug', async () => {
      const res = await request(app).get('/api/categories');
      const cat = res.body.data[0];
      expect(cat).toHaveProperty('id');
      expect(cat).toHaveProperty('name');
      expect(cat).toHaveProperty('slug');
    });

    it('returns multiple categories when seeded', async () => {
      await prisma.category.create({ data: { name: 'Second', slug: 'second', description: 'desc' } });
      const res = await request(app).get('/api/categories');
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });
});
