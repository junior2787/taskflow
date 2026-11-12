import { Router } from 'express';
import { prisma } from '../index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { createTaskSchema, updateTaskSchema, taskParamsSchema, queryTasksSchema } from '../validators/schemas.js';
import { validate } from '../middleware/validate.js';

export const tasksRouter = Router();

tasksRouter.get(
  '/',
  validate(queryTasksSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const { status, priority, page, limit, sortBy, sortOrder } = req.query;
    const userId = req.user!.id;

    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { [sortBy as string]: sortOrder },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      tasks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  })
);

tasksRouter.get(
  '/stats',
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const [byStatus, byPriority, overdue] = await Promise.all([
      prisma.task.groupBy({ by: ['status'], where: { userId }, _count: true }),
      prisma.task.groupBy({ by: ['priority'], where: { userId }, _count: true }),
      prisma.task.count({
        where: { userId, dueDate: { lt: new Date() }, status: { not: 'DONE' } },
      }),
    ]);

    res.json({
      byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
      byPriority: byPriority.reduce((acc, p) => ({ ...acc, [p.priority]: p._count }), {}),
      overdue,
    });
  })
);

tasksRouter.post(
  '/',
  validate(createTaskSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const { title, description, priority, dueDate } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: req.user!.id,
      },
    });
    res.status(201).json({ task });
  })
);

tasksRouter.get(
  '/:id',
  validate(taskParamsSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!task) throw new AppError(404, 'Tarefa não encontrada');
    res.json({ task });
  })
);

tasksRouter.put(
  '/:id',
  validate(updateTaskSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const { title, description, status, priority, dueDate } = req.body;
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!task) throw new AppError(404, 'Tarefa não encontrada');

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (status === 'DONE' && task.status !== 'DONE') updateData.completedAt = new Date();
    if (status !== 'DONE' && task.status === 'DONE') updateData.completedAt = null;

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json({ task: updated });
  })
);

tasksRouter.delete(
  '/:id',
  validate(taskParamsSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!task) throw new AppError(404, 'Tarefa não encontrada');

    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);