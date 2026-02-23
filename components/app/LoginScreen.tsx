import React from 'react';
import { Box, LogIn } from 'lucide-react';

interface LoginScreenProps {
  mode: 'SIGN_IN' | 'SIGN_UP';
  name: string;
  email: string;
  password: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleMode: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export default function LoginScreen({
  mode,
  name,
  email,
  password,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onToggleMode,
  isLoading,
  errorMessage
}: LoginScreenProps) {
  return (
    <div className="w-full h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border-2 border-slate-600 w-full max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-xl flex items-center justify-center transform rotate-3 shadow-lg">
            <Box size={40} className="text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white text-center mb-2 pixel-font">Incubem Tycoon</h1>

        <form onSubmit={onSubmit} className="space-y-4 mt-8 animate-in fade-in slide-in-from-bottom-4">
          {mode === 'SIGN_UP' && (
            <div>
              <label className="text-xs uppercase font-bold text-slate-400">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ex: Ana"
              />
            </div>
          )}
          <div>
            <label className="text-xs uppercase font-bold text-slate-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="voce@exemplo.com"
            />
          </div>
          <div>
            <label className="text-xs uppercase font-bold text-slate-400">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="********"
            />
          </div>
          {errorMessage && <div className="text-xs text-red-400">{errorMessage}</div>}
          <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 mt-2">
            <LogIn size={20} /> {mode === 'SIGN_UP' ? 'CRIAR CONTA' : 'ENTRAR'}
          </button>
          <button type="button" onClick={onToggleMode} className="w-full text-xs text-indigo-300 hover:text-indigo-200">
            {mode === 'SIGN_UP' ? 'Já tenho conta' : 'Quero criar conta'}
          </button>
        </form>
      </div>
    </div>
  );
}
