import { Request, Response, NextFunction } from 'express';

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = (req.headers['x-request-id'] as string | undefined) ?? crypto.randomUUID();
  (req as unknown as { requestId: string }).requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
}
