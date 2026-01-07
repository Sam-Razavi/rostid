import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(AppError.unauthorized());
  }

  if (req.user.role !== 'admin') {
    return next(AppError.forbidden('Admin access required'));
  }

  next();
}
