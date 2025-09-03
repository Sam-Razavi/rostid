import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import { AppError } from '../../utils/AppError';
import { errorHandler } from '../errorHandler';

function mockRes() {
  const json = vi.fn();
  const status = vi.fn().mockReturnThis() as unknown as Response['status'];
  const res = { json, status } as unknown as Response;
  (res as unknown as { json: typeof json }).json = json;
  return { res, json, status };
}

describe('errorHandler', () => {
  const req = {} as Request;
  const next = vi.fn() as unknown as NextFunction;

  it('handles ZodError with 400 and VALIDATION_ERROR code', () => {
    const schema = z.object({ name: z.string() });
    let zodErr: ZodError;
    try {
      schema.parse({ name: 123 });
    } catch (e) {
      zodErr = e as ZodError;
    }
    const { res, json, status } = mockRes();
    errorHandler(zodErr!, req, res, next);
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'VALIDATION_ERROR' })
    );
  });

  it('handles AppError with its statusCode and code', () => {
    const err = AppError.notFound('Order not found');
    const { res, json, status } = mockRes();
    errorHandler(err, req, res, next);
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'NOT_FOUND', message: 'Order not found' })
    );
  });

  it('handles AppError with no code falling back to ERROR', () => {
    const err = new AppError('Custom message', 422);
    const { res, json, status } = mockRes();
    errorHandler(err, req, res, next);
    expect(status).toHaveBeenCalledWith(422);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'ERROR' })
    );
  });

  it('handles generic Error with 500 in test env', () => {
    const err = new Error('Something broke');
    const { res, json, status } = mockRes();
    errorHandler(err, req, res, next);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'INTERNAL_ERROR' })
    );
  });

  it('handles unknown thrown value with 500', () => {
    const { res, json, status } = mockRes();
    errorHandler('string error', req, res, next);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'INTERNAL_ERROR' })
    );
  });
});
