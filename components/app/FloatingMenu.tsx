import React from 'react';
import { FilePlus, Home, Plus, Shield } from 'lucide-react';

interface FloatingMenuProps {
  visible: boolean;
  isMainMenuOpen: boolean;
  onToggleMainMenu: () => void;
  onCreateTask: () => void;
  onCreateSquad: () => void;
  onGoToBase: () => void;
  onGoToSquad: () => void;
}

export default function FloatingMenu({
  visible,
  isMainMenuOpen,
  onToggleMainMenu,
  onCreateTask,
  onCreateSquad,
  onGoToBase,
  onGoToSquad
}: FloatingMenuProps) {
  if (!visible) return null;

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40 flex items-end gap-6 pointer-events-auto">
      <button onClick={onGoToBase} className="flex flex-col items-center gap-1 group transition-all hover:-translate-y-1">
        <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center shadow-lg group-hover:bg-slate-700 group-hover:border-indigo-500">
          <Home size={20} className="text-indigo-400" />
        </div>
        <span className="text-[10px] font-bold text-slate-300 uppercase bg-slate-900/80 px-2 rounded backdrop-blur-sm">Minha Base</span>
      </button>

      <div className="relative flex flex-col items-center gap-1">
        {isMainMenuOpen && (
          <div className="absolute bottom-16 flex flex-col gap-3 items-center mb-2 w-max">
            <button
              onClick={onCreateTask}
              className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-full shadow-xl transition-all animate-in slide-in-from-bottom-2 fade-in duration-200 border-2 border-white/20"
            >
              <FilePlus size={20} />
              <span className="font-bold text-sm">Criar Task</span>
            </button>

            <button
              onClick={onCreateSquad}
              className="flex items-center gap-3 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-full shadow-lg transition-all animate-in slide-in-from-bottom-6 fade-in duration-300 delay-100 border border-slate-600"
            >
              <Shield size={18} />
              <span className="font-bold text-xs uppercase">Criar Squad</span>
            </button>
          </div>
        )}

        <button
          onClick={onToggleMainMenu}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 ${
            isMainMenuOpen ? 'bg-slate-700 rotate-45' : 'bg-indigo-600 hover:bg-indigo-500'
          }`}
        >
          <Plus size={32} className="text-white" />
        </button>
        <span className="text-[10px] font-bold text-white uppercase bg-slate-900/80 px-2 rounded backdrop-blur-sm">Criar</span>
      </div>

      <button onClick={onGoToSquad} className="flex flex-col items-center gap-1 group transition-all hover:-translate-y-1">
        <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center shadow-lg group-hover:bg-slate-700 group-hover:border-pink-500">
          <Shield size={20} className="text-pink-400" />
        </div>
        <span className="text-[10px] font-bold text-slate-300 uppercase bg-slate-900/80 px-2 rounded backdrop-blur-sm">Minha Squad</span>
      </button>
    </div>
  );
}
