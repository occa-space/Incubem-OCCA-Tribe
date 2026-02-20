import React from 'react';
import { CalendarDays, RefreshCcw, Repeat } from 'lucide-react';

export interface RenewalPromptData {
  buildingId: string;
  taskId: string;
  type: 'QUANTITY' | 'TIME';
}

interface RenewalPromptModalProps {
  renewalPrompt: RenewalPromptData;
  onRenew: (shouldRenew: boolean) => void;
}

export default function RenewalPromptModal({ renewalPrompt, onRenew }: RenewalPromptModalProps) {
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 pointer-events-auto">
      <div className="bg-slate-800 border-2 border-orange-500 rounded-xl shadow-2xl p-8 max-w-md w-full text-center animate-in zoom-in-95">
        <div className="w-16 h-16 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-orange-500">
          {renewalPrompt.type === 'QUANTITY' ? <Repeat size={32} className="text-orange-400" /> : <CalendarDays size={32} className="text-orange-400" />}
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Limite de Rotina Atingido!</h3>
        <p className="text-slate-400 mb-8">
          {renewalPrompt.type === 'QUANTITY'
            ? 'Esta tarefa atingiu o número máximo de execuções planejadas. Deseja adicionar mais ciclos?'
            : 'O prazo final planejado para esta rotina expirou. Deseja atualizar o deadline?'}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onRenew(true)}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            <RefreshCcw size={20} /> Sim, Renovação Imediata
          </button>
          <button
            onClick={() => onRenew(false)}
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-3 rounded-xl"
          >
            Não, Finalizar Tarefa
          </button>
        </div>
      </div>
    </div>
  );
}
