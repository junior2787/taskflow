import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Save, Eye, EyeOff, Bell, Moon, Sun } from 'lucide-react';
import clsx from 'clsx';

export default function Settings() {
  const { user, updateMe } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateMe({ name });
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil' });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As novas senhas não coincidem' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'A nova senha deve ter no mínimo 8 caracteres' });
      return;
    }

    setSaving(true);
    try {
      // Note: In a real app, you'd need a separate API endpoint for password change
      // This is a placeholder since our API doesn't have this endpoint yet
      setMessage({ type: 'success', text: 'Funcionalidade de alterar senha em desenvolvimento' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao alterar senha' });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const PasswordField = ({
    label,
    value,
    onChange,
    show,
    onToggleShow,
    placeholder,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggleShow: () => void;
    placeholder: string;
  }) => (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input pl-10 pr-10"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerencie sua conta e preferências</p>
      </div>

      {/* Profile Section */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil
          </h2>
        </div>
        <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary-700">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">{user?.name}</p>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="label">Nome</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Salvando...' : <Save className="h-4 w-4 mr-1" /> Salvar alterações}
            </button>
          </div>
        </form>
      </div>

      {/* Security Section */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Segurança
          </h2>
        </div>
        <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
          <p className="text-sm text-gray-500">
            Altere sua senha regularmente para manter sua conta segura.
          </p>
          <PasswordField
            label="Senha atual"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrentPassword}
            onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
            placeholder="••••••••"
          />
          <PasswordField
            label="Nova senha"
            value={newPassword}
            onChange={setNewPassword}
            show={showNewPassword}
            onToggleShow={() => setShowNewPassword(!showNewPassword)}
            placeholder="Mínimo 8 caracteres"
          />
          <PasswordField
            label="Confirmar nova senha"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirmPassword}
            onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
            placeholder="••••••••"
          />
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      </div>

      {/* Preferences Section */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Preferências
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Tema escuro</p>
              <p className="text-sm text-gray-500">Alterar entre modo claro e escuro</p>
            </div>
            <button
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors"
              role="switch"
              aria-checked={false}
            >
              <span className="inline-block h-4 w-4 transform bg-white rounded-full transition-transform" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Notificações por email</p>
              <p className="text-sm text-gray-500">Receber atualizações sobre suas tarefas</p>
            </div>
            <button
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors"
              role="switch"
              aria-checked={true}
            >
              <span className="inline-block h-4 w-4 transform bg-white rounded-full translate-x-6 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200">
        <div className="p-6 border-b border-red-200">
          <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Zona de perigo
          </h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Ações irreversíveis. Tenha cuidado.
          </p>
          <button className="btn-danger">
            Excluir conta
          </button>
        </div      </div>

      {message && (
        <div className={clsx('fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-sm', message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white')}>
          {message.text}
        </div>
      )}
    </div>
  );
}