import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../asyncHandler';

function mockReqRes() {
  const req = {} as Request;
  const res = {} as Response;
  const next = vi.fn() as unknown as NextFunction;
  return { req, res, next };
}

describe('asyncHandler', () => {
  it('calls the handler and does not call next on success', async () => {
    const { req, res, next } = mockReqRes();
    const handler = vi.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(handler);
    wrapped(req, res, next);
    await new Promise((r) => setTimeout(r, 10));
    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next with the error when the handler rejects', async () => {
    const { req, res, next } = mockReqRes();
    const err = new Error('Async failure');
    const handler = vi.fn().mockRejectedValue(err);
    const wrapped = asyncHandler(handler);
    wrapped(req, res, next);
    await new Promise((r) => setTimeout(r, 10));
    expect(next).toHaveBeenCalledWith(err);
  });

  it('calls next with AppError when handler throws AppError', async () => {
    const { req, res, next } = mockReqRes();
    const { AppError } = await import('../AppError');
    const appErr = AppError.notFound('Resource missing');
    const handler = vi.fn().mockRejectedValue(appErr);
    const wrapped = asyncHandler(handler);
    wrapped(req, res, next);
    await new Promise((r) => setTimeout(r, 10));
    expect(next).toHaveBeenCalledWith(appErr);
  });

  it('returns a RequestHandler function', () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(handler);
    expect(typeof wrapped).toBe('function');
    expect(wrapped.length).toBe(3);
  });
});
