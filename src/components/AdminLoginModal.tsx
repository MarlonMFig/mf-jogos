import React, { useState } from 'react';
import { Lock, X, ShieldAlert, KeyRound, Check } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPassword: string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPassword
}) => {
  const [inputPassword, setInputPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === currentPassword) {
      setError(false);
      setInputPassword('');
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Acesso do Administrador</h3>
              <p className="text-xs text-slate-400">Área restrita de gestão de links e pódio</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-950 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Digite a Senha de Administrador:
            </label>
            <div className="relative">
              <input
                type="password"
                autoFocus
                required
                value={inputPassword}
                onChange={(e) => {
                  setInputPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Informe sua senha..."
                className={`w-full bg-slate-950 border ${
                  error ? 'border-red-500 text-red-300' : 'border-slate-800 text-white focus:border-amber-500'
                } px-4 py-3 rounded-2xl text-sm focus:outline-none transition-colors font-mono`}
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute right-4 top-3.5" />
            </div>

            {error && (
              <p className="text-xs text-red-400 font-bold flex items-center gap-1 mt-1">
                <ShieldAlert className="w-4 h-4" /> Senha incorreta! Tente novamente.
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Entrar
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
