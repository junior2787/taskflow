import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
  }),
});

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Título é obrigatório').max(200),
    description: z.string().max(2000).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    dueDate: z.string().datetime().optional().nullable(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().cuid('ID inválido'),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional().nullable(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    dueDate: z.string().datetime().optional().nullable(),
  }),
});

export const taskParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid('ID inválido'),
  }),
});

export const queryTasksSchema = z.object({
  query: z.object({
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
    sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});