import { Router } from 'express';
import { prisma } from '../index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

export const usersRouter = Router();

usersRouter.get(
  '/search',
  asyncHandler(async (req: AuthRequest, res) => {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.json({ users: [] });
    }
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
        NOT: { id: req.user!.id },
      },
      select: { id: true, name: true, email: true, avatar: true },
      take: 10,
    });
    res.json({ users });
  })
);

usersRouter.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, avatar: true, createdAt: true },
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json({ user });
  })
);