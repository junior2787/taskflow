import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tasksApi } from '../lib/api';
import { Task, TaskStats, TaskState, CreateTaskData, UpdateTaskData, TaskStatus, Priority } from '../types';

const TaskContext = createContext<TaskState | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFiltersState] = useState({
    status: undefined as TaskStatus | undefined,
    priority: undefined as Priority | undefined,
    sortBy: 'createdAt' as string,
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  const fetchTasks = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        ...filters,
        page,
        limit: pagination.limit,
      };
      const { data } = await tasksApi.list(params);
      setTasks(data.tasks);
      setPagination(data.pagination);
    } catch (err: unknown) {
      setError('Erro ao carregar tarefas');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await tasksApi.stats();
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar stats:', err);
    }
  };

  const createTask = async (taskData: CreateTaskData) => {
    const { data } = await tasksApi.create(taskData);
    setTasks((prev) => [data.task, ...prev]);
    fetchStats();
    return data.task;
  };

  const updateTask = async (id: string, taskData: UpdateTaskData) => {
    const { data } = await tasksApi.update(id, taskData);
    setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
    fetchStats();
    return data.task;
  };

  const deleteTask = async (id: string) => {
    await tasksApi.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    fetchStats();
  };

  const setFilters = (newFilters: Partial<typeof filters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    fetchTasks(1);
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [filters.status, filters.priority, filters.sortBy, filters.sortOrder]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        stats,
        isLoading,
        error,
        pagination,
        filters,
        fetchTasks,
        fetchStats,
        createTask,
        updateTask,
        deleteTask,
        setFilters,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};