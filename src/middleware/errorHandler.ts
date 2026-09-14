import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Resource already exists' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Resource not found' });
    }
  }

  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
}