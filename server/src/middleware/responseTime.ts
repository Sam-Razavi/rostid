import type { Request, Response, NextFunction } from 'express';

export function responseTime(_req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  const originalWriteHead = res.writeHead.bind(res);
  res.writeHead = function (statusCode: number, ...args: unknown[]) {
    res.setHeader('X-Response-Time', `${Date.now() - start}ms`);
    return (originalWriteHead as (...a: unknown[]) => ReturnType<typeof res.writeHead>)(statusCode, ...args);
  };

  next();
}
