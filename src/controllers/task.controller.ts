import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from '../shared/schemas';
import { Priority, Status } from '@prisma/client';

export const createTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { title, description, priority, status, dueDate, assigneeId, checklist, teamId } = req.body as CreateTaskInput;

  if (!teamId) {
    throw new AppError('teamId is required to create a task', 400);
  }

  const teamExists = await prisma.team.findUnique({ where: { id: teamId } });
  if (!teamExists) {
    throw new AppError('Team not found', 404);
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority: (priority as Priority) ?? 'MEDIUM',
      status: (status as Status) ?? 'TODO',
      dueDate: dueDate ? new Date(dueDate) : null,
      team: {
        connect: { id: teamId },
      },
      ...(assigneeId ? { assignee: { connect: { id: assigneeId } } } : {}),
      checklist: {
        create: checklist.map((item) => ({
          text: item.text,
          completed: item.completed ?? false,
        })),
      },
    },
    include: {
      checklist: true,
      assignee: { select: { id: true, name: true, email: true } },
    },
  });

  res.status(201).json({
    success: true,
    data: task,
  });
});

export const getTasks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const query = req.query as unknown as TaskQueryInput;
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: {
    status?: Status;
    priority?: Priority;
    OR?: Array<{ title: { contains: string; mode: 'insensitive' } } | { description: { contains: string; mode: 'insensitive' } }>;
  } = {};

  if (query.status) {
    where.status = query.status as Status;
  }
  if (query.priority) {
    where.priority = query.priority as Priority;
  }
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        checklist: true,
        assignee: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.task.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: tasks,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getTaskById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    throw new AppError('Task ID is required', 400);
  }

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      checklist: true,
      assignee: { select: { id: true, name: true, email: true } },
    },
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  res.status(200).json({
    success: true,
    data: task,
  });
});

export const updateTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    throw new AppError('Task ID is required', 400);
  }

  const body = req.body as UpdateTaskInput;

  const existingTask = await prisma.task.findUnique({ where: { id } });
  if (!existingTask) {
    throw new AppError('Task not found', 404);
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      priority: body.priority ? (body.priority as Priority) : undefined,
      status: body.status ? (body.status as Status) : undefined,
      dueDate: body.dueDate !== undefined ? (body.dueDate ? new Date(body.dueDate) : null) : undefined,
      assigneeId: body.assigneeId,
    },
    include: {
      checklist: true,
      assignee: { select: { id: true, name: true, email: true } },
    },
  });

  res.status(200).json({
    success: true,
    data: task,
  });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    throw new AppError('Task ID is required', 400);
  }

  const existingTask = await prisma.task.findUnique({ where: { id } });
  if (!existingTask) {
    throw new AppError('Task not found', 404);
  }

  await prisma.task.delete({ where: { id } });

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
});