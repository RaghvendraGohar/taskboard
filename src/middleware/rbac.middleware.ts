import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';

// Middleware to verify if the user belongs to the target team and has the required minimum role
export const verifyTeamAccess = (requiredRoles: UserRole[] = ['ADMIN', 'MANAGER', 'MEMBER']) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const teamId = req.params['teamId'] || req.body['teamId'] || req.query['teamId'];

      if (!userId) {
        return next(new AppError('Unauthorized: User not authenticated', 401));
      }

      if (!teamId || typeof teamId !== 'string') {
        return next(new AppError('Team ID is required in params, body, or query', 400));
      }

      const membership = await prisma.teamMember.findUnique({
        where: {
          userId_teamId: {
            userId,
            teamId,
          },
        },
      });

      if (!membership) {
        return next(new AppError('Forbidden: You are not a member of this team', 403));
      }

      if (!requiredRoles.includes(membership.role as UserRole)) {
        return next(new AppError('Forbidden: You do not have the required permissions for this action', 403));
      }

      // Attach membership info to request for downstream controllers
      req.membership = {
        teamId: membership.teamId,
        role: membership.role as UserRole,
      };

      next();
    } catch (error: unknown) {
      next(error);
    }
  };
};