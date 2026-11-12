import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { authRouter } from './routes/auth.js';
import { tasksRouter } from './routes/tasks.js';
import { usersRouter } from './routes/users.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Muitas requisições, tente novamente mais tarde' },
});
app.use('/api/', limiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/tasks', authMiddleware, tasksRouter);
app.use('/api/users', authMiddleware, usersRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});