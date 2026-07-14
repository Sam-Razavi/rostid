import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../app';

async function loginCustomer() {
  const res = await request(app).post('/api/auth/login').send({
    email: 'customer@test.com',
    password: 'password123',
  });
  return res.body.data.accessToken as string;
}

describe('Users API', () => {
  describe('PATCH /api/users/me', () => {
    it('updates the user name', async () => {
      const token = await loginCustomer();

      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.user.name).toBe('Updated Name');
    });

    it('updates the user email', async () => {
      const token = await loginCustomer();

      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'updated@test.com' });

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('updated@test.com');
    });

    it('rejects email already taken by another user', async () => {
      const token = await loginCustomer();

      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'admin@test.com' });

      expect(res.status).toBe(409);
    });

    it('requires authentication', async () => {
      const res = await request(app).patch('/api/users/me').send({ name: 'Unauthorized' });

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/users/me/password', () => {
    it('changes password with correct current password', async () => {
      const token = await loginCustomer();

      const res = await request(app)
        .patch('/api/users/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'password123', newPassword: 'newpassword456' });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/password changed/i);
    });

    it('rejects incorrect current password', async () => {
      const token = await loginCustomer();

      const res = await request(app)
        .patch('/api/users/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'wrongpassword', newPassword: 'newpassword456' });

      expect(res.status).toBe(400);
    });

    it('validates new password minimum length', async () => {
      const token = await loginCustomer();

      const res = await request(app)
        .patch('/api/users/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'password123', newPassword: 'short' });

      expect(res.status).toBe(400);
    });

    it('requires authentication', async () => {
      const res = await request(app)
        .patch('/api/users/me/password')
        .send({ currentPassword: 'password123', newPassword: 'newpassword456' });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/users/me', () => {
    it('returns 204 and subsequent login fails', async () => {
      const token = await loginCustomer();

      const deleteRes = await request(app)
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${token}`);
      expect(deleteRes.status).toBe(204);

      // Original credentials should no longer work
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'customer@test.com', password: 'password123' });
      expect(loginRes.status).toBe(401);
    });

    it('requires authentication', async () => {
      const res = await request(app).delete('/api/users/me');
      expect(res.status).toBe(401);
    });
  });
});
