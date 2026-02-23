import React from 'react';
import { Check, X } from 'lucide-react';
import { Squad, User } from '../../types';

interface SquadSelectorModalProps {
  squads: Squad[];
  currentUser: User;
  onClose: () => void;
  onSelectSquad: (squad: Squad) => void;
}

const ALLOWED_SQUAD_IDS = new Set(['sq_osc', 'sq_board']);

export default function SquadSelectorModal({ squads, currentUser, onClose, onSelectSquad }: SquadSelectorModalProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 pointer-events-auto">
      <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-600 w-full max-md animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Migrar de Squad</h2>
          <button onClick={onClose}><X /></button>
        </div>
        <p className="text-sm text-slate-400 mb-4">Escolha uma nova Squad para se aliar. Seus dados serão mantidos.</p>
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {squads.map((s) => {
            const canSelect =
              ALLOWED_SQUAD_IDS.has(s.id) ||
              s.name.toLowerCase() === 'occa social club' ||
              s.name.toLowerCase() === 'board';
            return (
              <button
                key={s.id}
                onClick={() => onSelectSquad(s)}
                disabled={!canSelect || currentUser.squadId === s.id}
                className={`w-full p-4 rounded-lg text-left flex justify-between items-center transition-colors border ${currentUser.squadId === s.id ? 'bg-indigo-900/50 border-indigo-500' : 'bg-slate-700 border-slate-600'} ${(!canSelect || currentUser.squadId === s.id) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-600'}`}
              >
                <span className="font-bold text-white">{s.name}</span>
                {currentUser.squadId === s.id && <Check size={16} className="text-indigo-400" />}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">Apenas OCCA Social Club está habilitado.</p>
      </div>
    </div>
  );
}
