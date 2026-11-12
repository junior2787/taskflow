import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/middleware/auth.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const password = await hashPassword('senha123');

  const user = await prisma.user.upsert({
    where: { email: 'demo@taskflow.com' },
    update: {},
    create: {
      email: 'demo@taskflow.com',
      password,
      name: 'Demo User',
    },
  });

  const tasks = [
    { title: 'Configurar projeto', description: 'Inicializar repositório e dependências', status: 'DONE', priority: 'HIGH' },
    { title: 'Criar API de autenticação', description: 'Login, register, JWT', status: 'DONE', priority: 'HIGH' },
    { title: 'Implementar CRUD de tarefas', description: 'Create, read, update, delete', status: 'IN_PROGRESS', priority: 'HIGH' },
    { title: 'Adicionar validação com Zod', description: 'Schemas para todas as rotas', status: 'TODO', priority: 'MEDIUM' },
    { title: 'Escrever testes unitários', description: 'Cobertura > 80%', status: 'TODO', priority: 'MEDIUM' },
    { title: 'Configurar CI/CD', description: 'GitHub Actions para test e deploy', status: 'TODO', priority: 'LOW' },
    { title: 'Documentar API', description: 'OpenAPI/Swagger', status: 'TODO', priority: 'LOW' },
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: { ...task, userId: user.id },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Demo user: demo@taskflow.com / senha123`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });