export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | null;
  completedAt?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskStats {
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<Priority, number>;
  overdue: number;
}

export interface PaginatedResponse<T> {
  tasks: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export interface TaskState {
  tasks: Task[];
  stats: TaskStats | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    status?: TaskStatus;
    priority?: Priority;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
  fetchTasks: (page?: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  createTask: (data: CreateTaskData) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskData) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  setFilters: (filters: Partial<TaskState['filters']>) => void;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string | null;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string | null;
}