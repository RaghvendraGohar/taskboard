import { Response } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
});

export const addMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']).default('MEMBER'),
});

export const createTeam = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  const { name } = req.body as z.infer<typeof createTeamSchema>;

  // Create team and assign the creator as an ADMIN in a single transaction
  const team = await prisma.team.create({
    data: {
      name,
      members: {
        create: {
          userId,
          role: 'ADMIN',
        },
      },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  res.status(201).json({
    success: true,
    data: team,
  });
});

export const getMyTeams = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  const memberships = await prisma.teamMember.findMany({
    where: { userId },
    include: {
      team: {
        include: {
          _count: { select: { members: true, tasks: true } },
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    data: memberships.map((m) => ({
      ...m.team,
      myRole: m.role,
    })),
  });
});

export const addTeamMember = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { teamId } = req.params;
  const { email, role } = req.body as z.infer<typeof addMemberSchema>;

  if (!teamId) {
    throw new AppError('Team ID is required', 400);
  }

  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) {
    throw new AppError('User with this email does not exist', 404);
  }

  const existingMembership = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId: targetUser.id,
        teamId,
      },
    },
  });

  if (existingMembership) {
    throw new AppError('User is already a member of this team', 400);
  }

  const newMember = await prisma.teamMember.create({
    data: {
      userId: targetUser.id,
      teamId,
      role: role as UserRole,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  res.status(201).json({
    success: true,
    data: newMember,
  });
});