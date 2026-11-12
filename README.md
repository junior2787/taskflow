# TaskFlow - Gerenciador de Tarefas Full-Stack

![TaskFlow](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

> Um gerenciador de tarefas moderno e completo, construído com **React + TypeScript** no frontend e **Node.js/Express + TypeScript** no backend. Inclui autenticação JWT, API RESTful, banco de dados PostgreSQL com Prisma ORM, e interface responsiva com Tailwind CSS.

## 🚀 Funcionalidades

### 🔐 Autenticação & Segurança
- **Registro e Login** com validação robusta (Zod)
- **JWT (JSON Web Tokens)** com expiração de 7 dias
- **Hash de senha** com bcryptjs (cost factor 12)
- **Rate limiting** (100 req/15min por IP)
- **Helmet.js** para headers de segurança HTTP
- **CORS** configurado adequadamente
- **Proteção de rotas** no frontend e backend

### 📋 Gerenciamento de Tarefas
- **CRUD completo** (Criar, Ler, Atualizar, Excluir)
- **Status**: A fazer → Em andamento → Concluído
- **Prioridades**: Baixa, Média, Alta, Urgente
- **Datas de vencimento** com indicador visual de atraso
- **Filtros** por status, prioridade
- **Paginação** server-side
- **Ordenação** por data, prioridade, status
- **Estatísticas** em tempo real (cards de resumo)

### 🎨 Interface Moderna
- **Design responsivo** (mobile-first)
- **Sidebar colapsável** com navegação
- **Modais** para criar/editar tarefas
- **Dropdown menus** para ações rápidas
- **Feedback visual** (loading, empty states, erros)
- **Tema consistente** com Tailwind CSS

### 🛠 Stack Técnica

#### Backend (`packages/server`)
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Node.js | 20+ | Runtime |
| Express | 4.18 | Framework web |
| TypeScript | 5.3 | Tipagem estática |
| Prisma | 5.8 | ORM |
| PostgreSQL | 16 | Banco de dados |
| Zod | 3.22 | Validação de schemas |
| JWT | 9.0 | Autenticação |
| bcryptjs | 2.4 | Hash de senhas |
| Vitest | 1.2 | Testes unitários |
| ESLint | 8.56 | Linting |

#### Frontend (`packages/client`)
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 18.2 | UI Library |
| TypeScript | 5.3 | Tipagem estática |
| Vite | 5.0 | Build tool |
| Tailwind CSS | 3.4 | Estilização |
| React Router | 6.21 | Roteamento |
| Axios | 1.6 | HTTP Client |
| Zustand | 4.4 | State management |
| date-fns | 3.2 | Manipulação de datas |
| Lucide React | 0.303 | Ícones |
| Vitest | 1.2 | Testes unitários |

## 📦 Estrutura do Projeto

```
taskflow/
├── docker-compose.yml          # Orquestração de containers
├── package.json                # Workspace root (npm workspaces)
├── README.md
├── packages/
│   ├── server/                 # Backend API
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Schema do banco
│   │   │   └── seed.ts         # Dados iniciais
│   │   ├── src/
│   │   │   ├── index.ts        # Entry point
│   │   │   ├── middleware/     # Auth, error handling, validation
│   │   │   ├── routes/         # Auth, tasks, users
│   │   │   └── validators/     # Zod schemas
│   │   ├── Dockerfile
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   └── client/                 # Frontend React
│       ├── src/
│       │   ├── components/     # Layout, UI components
│       │   ├── context/        # AuthContext, TaskContext
│       │   ├── lib/            # API client (axios)
│       │   ├── pages/          # Login, Register, Dashboard, TaskDetail, Settings
│       │   ├── types/          # TypeScript interfaces
│       │   ├── App.tsx         # Routes & providers
│       │   └── main.tsx        # Entry point
│       ├── Dockerfile
│       ├── tsconfig.json
│       ├── tailwind.config.js
│       └── vite.config.ts
```

## ⚡ Quick Start

### Pré-requisitos
- **Node.js 20+** e **npm 10+**
- **Docker** e **Docker Compose** (opcional, para PostgreSQL)
- **PostgreSQL 16+** (se não usar Docker)

### 1. Clone e instale dependências
```bash
git clone https://github.com/seu-usuario/taskflow.git
cd taskflow
npm install
```

### 2. Configure variáveis de ambiente
```bash
# Backend
cp packages/server/.env.example packages/server/.env
# Edite packages/server/.env com suas credenciais
```

### 3. Inicie o banco de dados (Docker)
```bash
docker-compose up -d postgres
```

### 4. Configure o banco
```bash
cd packages/server
npx prisma migrate dev --name init
npx prisma db seed
cd ../..
```

### 5. Inicie em modo desenvolvimento
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client

# Ou ambos juntos:
npm run dev
```

### 6. Acesse a aplicação
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3001
- **Health check**: http://localhost:3001/health

### Credenciais de demo
```
Email: demo@taskflow.com
Senha: senha123
```

## 🐳 Docker (Produção)

```bash
# Build e start de todos os serviços
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Parar e remover volumes (cuidado: apaga dados do banco)
docker-compose down -v
```

## 📚 API Endpoints

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrar usuário |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Perfil do usuário logado |
| PUT | `/api/auth/me` | Atualizar perfil |

### Tarefas (requer Authorization: Bearer \<token\>)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/tasks` | Listar tarefas (com filtros/paginação) |
| GET | `/api/tasks/stats` | Estatísticas do usuário |
| POST | `/api/tasks` | Criar tarefa |
| GET | `/api/tasks/:id` | Obter tarefa |
| PUT | `/api/tasks/:id` | Atualizar tarefa |
| DELETE | `/api/tasks/:id` | Excluir tarefa |

### Usuários
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/users/search?q=` | Buscar usuários |
| GET | `/api/users/:id` | Obter usuário |

### Query Parameters (GET /api/tasks)
| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| status | enum | - | TODO, IN_PROGRESS, DONE |
| priority | enum | - | LOW, MEDIUM, HIGH, URGENT |
| page | int | 1 | Página |
| limit | int | 10 | Itens por página (max 50) |
| sortBy | enum | createdAt | createdAt, updatedAt, dueDate, priority |
| sortOrder | enum | desc | asc, desc |

## 🧪 Testes

```bash
# Backend
cd packages/server
npm run test        # Rodar testes
npm run test:watch  # Watch mode

# Frontend
cd packages/client
npm run test
```

## 📝 Scripts Disponíveis

```bash
# Root
npm run dev              # Inicia server + client
npm run dev:server       # Apenas backend
npm run dev:client       # Apenas frontend
npm run build            # Build de todos os packages
npm run test             # Testes de todos
npm run lint             # Lint de todos
npm run db:migrate       # Migrations do Prisma
npm run db:seed          # Seed do banco
npm run db:studio        # Prisma Studio (GUI)

# Server
npm run dev              # tsx watch
npm run build            # tsc
npm run start            # node dist/index.js

# Client
npm run dev              # vite
npm run build            # tsc && vite build
npm run preview          # vite preview
```

## 🔒 Variáveis de Ambiente

### Server (`packages/server/.env`)
```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/taskflow?schema=public"

# JWT (mínimo 32 chars em produção!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"

# Server
PORT=3001
NODE_ENV=development

# CORS
CLIENT_URL="http://localhost:5173"
```

## 🎯 Roadmap / Melhorias Futuras

- [ ] Testes E2E com Playwright/Cypress
- [ ] CI/CD com GitHub Actions
- [ ] Notificações em tempo real (WebSockets/Socket.io)
- [ ] Compartilhamento de tarefas entre usuários
- [ ] Anexos de arquivos
- [ ] Categorias/Tags personalizadas
- [ ] Modo offline com Service Workers
- [ ] Dark mode completo
- [ ] Internacionalização (i18n)
- [ ] Documentação OpenAPI/Swagger

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Junior Moura**
- GitHub: [@junior2787](https://github.com/junior2787)
- Email: juniormoura746@gmail.com

---

⭐ **Se este projeto te ajudou, deixe uma estrela no GitHub!**