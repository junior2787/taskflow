import { useState } from 'react';
import { Plus, Filter, Search, ChevronDown, MoreVertical, CheckCircle2, Clock, AlertTriangle, Flag } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { Task, TaskStatus, Priority } from '../types';
import { format, isPast, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import clsx from 'clsx';

const statusConfig: Record<TaskStatus, { label: string; icon: React.ReactNode; className: string }> = {
  TODO: { label: 'A fazer', icon: <Clock className="h-4 w-4" />, className: 'bg-gray-100 text-gray-700' },
  IN_PROGRESS: { label: 'Em andamento', icon: <AlertTriangle className="h-4 w-4" />, className: 'bg-blue-100 text-blue-700' },
  DONE: { label: 'Concluído', icon: <CheckCircle2 className="h-4 w-4" />, className: 'bg-green-100 text-green-700' },
};

const priorityConfig: Record<Priority, { label: string; className: string; icon: React.ReactNode }> = {
  LOW: { label: 'Baixa', className: 'bg-gray-100 text-gray-700', icon: <Flag className="h-3 w-3" /> },
  MEDIUM: { label: 'Média', className: 'bg-yellow-100 text-yellow-700', icon: <Flag className="h-3 w-3" /> },
  HIGH: { label: 'Alta', className: 'bg-orange-100 text-orange-700', icon: <Flag className="h-3 w-3" /> },
  URGENT: { label: 'Urgente', className: 'bg-red-100 text-red-700', icon: <Flag className="h-3 w-3" /> },
};

function TaskCard({ task, onUpdate, onDelete }: { task: Task; onUpdate: (id: string, data: Partial<Task>) => Promise<void>; onDelete: (id: string) => Promise<void> }) {
  const [showMenu, setShowMenu] = useState(false);
  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'DONE';

  const handleStatusChange = async (newStatus: TaskStatus) => {
    await onUpdate(task.id, { status: newStatus });
  };

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h3 className="font-medium text-gray-900 line-clamp-1 flex-1">{task.title}</h3>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 z-20 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                    <button
                      onClick={() => handleStatusChange(task.status === 'DONE' ? 'TODO' : 'DONE')}
                      className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {task.status === 'DONE' ? 'Marcar como pendente' : 'Marcar como concluída'}
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-gray-100"
                    >
                      Excluir
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {task.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', statusConfig[task.status].className)}>
              <span className="flex items-center gap-1">
                {statusConfig[task.status].icon}
                {statusConfig[task.status].label}
              </span>
            </span>
            <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', priorityConfig[task.priority].className)}>
              <span className="flex items-center gap-1">
                {priorityConfig[task.priority].icon}
                {priorityConfig[task.priority].label}
              </span>
            </span>
            {task.dueDate && (
              <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1', isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700')}>
                <Clock className="h-3 w-3" />
                {format(parseISO(task.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                {isOverdue && <span className="text-red-600">(atrasado)</span>}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCards({ stats }: { stats: { byStatus: Record<TaskStatus, number>; byPriority: Record<Priority, number>; overdue: number } | null }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="card p-4">
        <p className="text-sm text-gray-500">Total</p>
        <p className="text-2xl font-bold text-gray-900">
          {Object.values(stats.byStatus).reduce((a, b) => a + b, 0)}
        </p>
      </div>
      <div className="card p-4">
        <p className="text-sm text-gray-500">A fazer</p>
        <p className="text-2xl font-bold text-gray-700">{stats.byStatus.TODO || 0}</p>
      </div>
      <div className="card p-4">
        <p className="text-sm text-gray-500">Em andamento</p>
        <p className="text-2xl font-bold text-blue-700">{stats.byStatus.IN_PROGRESS || 0}</p>
      </div>
      <div className="card p-4">
        <p className="text-sm text-gray-500">Concluídas</p>
        <p className="text-2xl font-bold text-green-700">{stats.byStatus.DONE || 0}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { tasks, stats, isLoading, pagination, filters, fetchTasks, createTask, updateTask, deleteTask, setFilters } = useTasks();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM' as Priority, dueDate: '' });
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    setCreating(true);
    try {
      await createTask({
        title: newTask.title,
        description: newTask.description || undefined,
        priority: newTask.priority,
        dueDate: newTask.dueDate || null,
      });
      setShowCreateModal(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Olá, {user?.name}!</h1>
          <p className="text-gray-600">Aqui está o resumo das suas tarefas</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova tarefa
        </button>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar tarefas..."
              className="input pl-10"
            />
          </div>
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ status: e.target.value as TaskStatus | undefined })}
            className="input w-full sm:w-40"
          >
            <option value="">Todos os status</option>
            <option value="TODO">A fazer</option>
            <option value="IN_PROGRESS">Em andamento</option>
            <option value="DONE">Concluídas</option>
          </select>
          <select
            value={filters.priority || ''}
            onChange={(e) => setFilters({ priority: e.target.value as Priority | undefined })}
            className="input w-full sm:w-40"
          >
            <option value="">Todas prioridades</option>
            <option value="LOW">Baixa</option>
            <option value="MEDIUM">Média</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="card">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Carregando tarefas...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma tarefa encontrada</h3>
            <p className="text-gray-500 mb-4">Comece criando sua primeira tarefa</p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              <Plus className="h-5 w-5 mr-2" />
              Criar tarefa
            </button>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Página {pagination.page} de {pagination.totalPages} ({pagination.total} tarefas)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchTasks(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="btn-secondary text-sm"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => fetchTasks(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="btn-secondary text-sm"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Nova tarefa</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div>
                <label htmlFor="title" className="label">Título *</label>
                <input
                  id="title"
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="input"
                  placeholder="O que precisa ser feito?"
                  required
                  maxLength={200}
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="description" className="label">Descrição</label>
                <textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="input min-h-[100px] resize-y"
                  placeholder="Detalhes opcionais..."
                  maxLength={2000}
                />
              </div>
              <div>
                <label htmlFor="priority" className="label">Prioridade</label>
                <select
                  id="priority"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
                  className="input"
                >
                  <option value="LOW">Baixa</option>
                  <option value="MEDIUM">Média</option>
                  <option value="HIGH">Alta</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>
              <div>
                <label htmlFor="dueDate" className="label">Data de vencimento</label>
                <input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="input"
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || !newTask.title.trim()}
                  className="btn-primary flex-1"
                >
                  {creating ? 'Criando...' : 'Criar tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}