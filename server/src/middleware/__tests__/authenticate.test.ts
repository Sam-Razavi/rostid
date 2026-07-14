import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../authenticate';
import { signAccessToken } from '../../utils/jwt';

function mockContext(authHeader?: string) {
  const req = {
    headers: authHeader ? { authorization: authHeader } : {},
  } as unknown as Request;
  const res = {} as Response;
  const next = vi.fn() as unknown as NextFunction;
  return { req, res, next };
}

describe('authenticate middleware', () => {
  it('calls next with unauthorized error when no Authorization header', () => {
    const { req, res, next } = mockContext();
    authenticate(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('calls next with unauthorized error for non-Bearer scheme', () => {
    const { req, res, next } = mockContext('Basic dXNlcjpwYXNz');
    authenticate(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('calls next with unauthorized for invalid token', () => {
    const { req, res, next } = mockContext('Bearer not.a.token');
    authenticate(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('attaches user to req and calls next() without error for valid token', () => {
    const payload = { userId: 'user-1', email: 'a@b.com', role: 'customer' };
    const token = signAccessToken(payload);
    const { req, res, next } = mockContext(`Bearer ${token}`);
    authenticate(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect((req as unknown as { user: typeof payload }).user.userId).toBe('user-1');
    expect((req as unknown as { user: typeof payload }).user.email).toBe('a@b.com');
  });

  it('attaches role to req.user', () => {
    const token = signAccessToken({ userId: 'admin-1', email: 'admin@b.com', role: 'admin' });
    const { req, res, next } = mockContext(`Bearer ${token}`);
    authenticate(req, res, next);
    expect((req as unknown as { user: { role: string } }).user.role).toBe('admin');
  });
});
