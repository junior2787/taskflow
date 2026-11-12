import { Router } from 'express';
import { prisma } from '../index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { authMiddleware, generateToken, hashPassword, comparePassword } from '../middleware/auth.js';
import { registerSchema, loginSchema } from '../validators/schemas.js';
import { validate } from '../middleware/validate.js';

export const authRouter = Router();

authRouter.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError(409, 'Email já cadastrado');
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    const token = generateToken(user);
    res.status(201).json({ user, token });
  })
);

authRouter.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await comparePassword(password, user.password))) {
      throw new AppError(401, 'Credenciais inválidas');
    }

    const token = generateToken({ id: user.id, email: user.email, name: user.name });
    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  })
);

authRouter.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, avatar: true, createdAt: true },
    });
    res.json({ user });
  })
);

authRouter.put(
  '/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { name, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, avatar },
      select: { id: true, email: true, name: true, avatar: true },
    });
    res.json({ user });
  })
);