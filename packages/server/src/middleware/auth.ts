import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      name: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Usuário não encontrado' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expirado' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Token inválido' });
      return;
    }
    res.status(500).json({ error: 'Erro na autenticação' });
  }
};

export const generateToken = (user: { id: string; email: string; name: string }): string => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
};

export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hash);
};