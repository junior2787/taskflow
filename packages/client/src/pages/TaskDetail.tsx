import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, CheckCircle2, Clock, AlertTriangle, Flag, Calendar, Edit2 } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { Task, TaskStatus, Priority } from '../types';
import { format, isPast, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import clsx from 'clsx';

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  TODO: { label: 'A fazer', className: 'bg-gray-100 text-gray-700' },
  IN_PROGRESS: { label: 'Em andamento', className: 'bg-blue-100 text-blue-700' },
  DONE: { label: 'Concluído', className: 'bg-green-100 text-green-700' },
};

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  LOW: { label: 'Baixa', className: 'bg-gray-100 text-gray-700' },
  MEDIUM: { label: 'Média', className: 'bg-yellow-100 text-yellow-700' },
  HIGH: { label: 'Alta', className: 'bg-orange-100 text-orange-700' },
  URGENT: { label: 'Urgente', className: 'bg-red-100 text-red-700' },
};

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, updateTask, deleteTask } = useTasks();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO' as TaskStatus,
    priority: 'MEDIUM' as Priority,
    dueDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      const found = tasks.find((t) => t.id === id);
      if (found) {
        setTask(found);
        setFormData({
          title: found.title,
          description: found.description || '',
          status: found.status,
          priority: found.priority,
          dueDate: found.dueDate ? format(parseISO(found.dueDate), 'yyyy-MM-dd') : '',
        });
      }
      setIsLoading(false);
    }
  }, [id, tasks]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    setSaving(true);
    setError('');

    try {
      await updateTask(task.id, {
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
      });
      setIsEditing(false);
    } catch (err) {
      setError('Erro ao salvar alterações');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !window.confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    setDeleting(true);
    try {
      await deleteTask(task.id);
      navigate('/');
    } catch (err) {
      setError('Erro ao excluir tarefa');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <ArrowLeft className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-gray-900 mb-2">Tarefa não encontrada</h2>
        <button onClick={() => navigate('/')} className="btn-primary">
          Voltar para dashboard
        </button>
      </div>
    );
  }

  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'DONE';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/')} className="btn-ghost p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
          <p className="text-gray-500 text-sm">
            Criada em {format(parseISO(task.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            disabled={saving}
            className="btn-secondary"
          >
            {isEditing ? (
              <> <Save className="h-4 w-4 mr-1" /> Salvar </>
            ) : (
              <> <Edit2 className="h-4 w-4 mr-1" /> Editar </>
            )}
          </button>
          <button onClick={handleDelete} disabled={deleting} className="btn-danger">
            {deleting ? 'Excluindo...' : <Trash2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Status & Priority Badges */}
      <div className="flex flex-wrap gap-2">
        <span className={clsx('px-3 py-1 rounded-full text-sm font-medium', statusConfig[task.status].className)}>
          {task.status === 'DONE' && <CheckCircle2 className="inline h-3 w-3 mr-1" />}
          {task.status === 'IN_PROGRESS' && <AlertTriangle className="inline h-3 w-3 mr-1" />}
          {task.status === 'TODO' && <Clock className="inline h-3 w-3 mr-1" />}
          {statusConfig[task.status].label}
        </span>
        <span className={clsx('px-3 py-1 rounded-full text-sm font-medium', priorityConfig[task.priority].className)}>
          <Flag className="inline h-3 w-3 mr-1" />
          {priorityConfig[task.priority].label}
        </span>
        {task.dueDate && (
          <span className={clsx('px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1', isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700')}>
            <Calendar className="h-3 w-3" />
            {format(parseISO(task.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
            {isOverdue && <span className="text-red-600">(atrasado)</span>}
          </span>
        )}
      </div>

      {/* Description */}
      <div className="card p-6">
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="title" className="label">Título</label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
                required
                maxLength={200}
              />
            </div>
            <div>
              <label htmlFor="description" className="label">Descrição</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input min-h-[120px] resize-y"
                maxLength={2000}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="label">Status</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                  className="input"
                >
                  <option value="TODO">A fazer</option>
                  <option value="IN_PROGRESS">Em andamento</option>
                  <option value="DONE">Concluído</option>
                </select>
              </div>
              <div>
                <label htmlFor="priority" className="label">Prioridade</label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                  className="input"
                >
                  <option value="LOW">Baixa</option>
                  <option value="MEDIUM">Média</option>
                  <option value="HIGH">Alta</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="dueDate" className="label">Data de vencimento</label>
              <input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="input"
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </form>
        ) : (
          <>
            {task.description ? (
              <div className="prose prose-gray max-w-none">
                <p className="whitespace-pre-wrap">{task.description}</p>
              </div>
            ) : (
              <p className="text-gray-400 italic">Sem descrição</p>
            )}
          </>
        )}
      </div>

      {/* Metadata */}
      <div className="card p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Informações</h3>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">ID</dt>
            <dd className="font-mono text-gray-900">{task.id}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Criada em</dt>
            <dd className="text-gray-900">{format(parseISO(task.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Atualizada em</dt>
            <dd className="text-gray-900">{format(parseISO(task.updatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</dd>
          </div>
          {task.completedAt && (
            <div>
              <dt className="text-gray-500">Concluída em</dt>
              <dd className="text-gray-900">{format(parseISO(task.completedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}