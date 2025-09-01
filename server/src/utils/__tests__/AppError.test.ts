import { describe, it, expect } from 'vitest';
import { AppError } from '../AppError';

describe('AppError', () => {
  it('constructs with message and defaults', () => {
    const err = new AppError('Something broke');
    expect(err.message).toBe('Something broke');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBeUndefined();
    expect(err.name).toBe('AppError');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it('badRequest returns 400', () => {
    const err = AppError.badRequest('Bad input', 'BAD_FIELD');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Bad input');
    expect(err.code).toBe('BAD_FIELD');
  });

  it('unauthorized returns 401', () => {
    const err = AppError.unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('unauthorized accepts custom message', () => {
    const err = AppError.unauthorized('Token expired');
    expect(err.message).toBe('Token expired');
    expect(err.statusCode).toBe(401);
  });

  it('forbidden returns 403', () => {
    const err = AppError.forbidden();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  it('notFound returns 404', () => {
    const err = AppError.notFound('Product not found');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Product not found');
  });

  it('conflict returns 409', () => {
    const err = AppError.conflict('Email in use', 'EMAIL_TAKEN');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('EMAIL_TAKEN');
  });

  it('internal returns 500', () => {
    const err = AppError.internal();
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('INTERNAL_ERROR');
  });

  it('instanceof check works after serialization workaround', () => {
    const err = AppError.notFound();
    expect(err instanceof AppError).toBe(true);
    expect(err instanceof Error).toBe(true);
  });
});
