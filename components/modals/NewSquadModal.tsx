import React from 'react';
import { Check, Shield } from 'lucide-react';
import { BuildingType, User } from '../../types';
import { BUILD_COSTS } from '../../constants';

interface NewSquadModalProps {
  newSquadName: string;
  newSquadColor: string;
  squadColors: string[];
  currentUser: User | null;
  onNameChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function NewSquadModal({
  newSquadName,
  newSquadColor,
  squadColors,
  currentUser,
  onNameChange,
  onColorChange,
  onCancel,
  onConfirm
}: NewSquadModalProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 pointer-events-auto">
      <div className="bg-slate-800 border-2 border-red-500 rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-600 p-3 rounded-lg"><Shield size={24} className="text-white" /></div>
          <div>
            <h2 className="text-xl font-bold text-white">Fundar Nova Squad</h2>
            <p className="text-sm text-slate-400">Estabeleça um QG para sua nova equipe.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nome da Squad</label>
            <input
              type="text"
              value={newSquadName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Ex: Squad Omega"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-red-500 outline-none"
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Cor da Squad</label>
            <div className="flex flex-wrap gap-2">
              {squadColors.map((color) => (
                <button
                  key={color}
                  onClick={() => onColorChange(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${newSquadColor === color ? 'border-white scale-110 ring-2 ring-indigo-500' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded border border-slate-700 flex justify-between items-center">
            <span className="text-sm text-slate-400">Custo de Fundação</span>
            <span className="text-yellow-400 font-bold flex items-center gap-1">
              {currentUser?.squadId === 'temp_pending' ? 'GRÁTIS' : BUILD_COSTS[BuildingType.SQUAD_HQ].coins}
            </span>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={onCancel} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-colors">Cancelar</button>
            <button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Check size={18} /> Fundar Squad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
