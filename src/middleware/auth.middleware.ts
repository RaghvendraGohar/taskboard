import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { AuthUserPayload } from '../types/express';

function isAuthUserPayload(decoded: string | JwtPayload): decoded is JwtPayload & AuthUserPayload {
  return (
    typeof decoded === 'object' &&
    decoded !== null &&
    typeof (decoded as Record<string, unknown>).userId === 'string' &&
    typeof (decoded as Record<string, unknown>).email === 'string'
  );
}

export const protect = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Not authorized, token missing', 401));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new AppError('Not authorized, token missing', 401));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (!isAuthUserPayload(decoded)) {
      return next(new AppError('Not authorized, invalid token payload', 401));
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch {
    return next(new AppError('Not authorized, token failed verification', 401));
  }
};