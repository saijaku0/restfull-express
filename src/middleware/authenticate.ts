import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { TokenPayload } from '../utils/token';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError(401, 'Authentication required');
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, env.jwt.accessSecret) as TokenPayload;
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
}