import React from 'react';
import { User } from '../../types';

interface MarketContainerProps {
  currentUser: User;
  userCoins: number;
  onPurchaseSuccess: (cost: number) => void;
}

export default function MarketContainer({ currentUser, userCoins, onPurchaseSuccess }: MarketContainerProps) {
  return (
    <div className="p-6 space-y-4">
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Mercado</h2>
        <p className="text-slate-400 text-sm">
          Area em modularizacao. Usuario: <span className="text-indigo-300 font-semibold">{currentUser.name}</span>
        </p>
        <div className="text-xs uppercase text-slate-500 font-bold mt-4">Moedas</div>
        <div className="text-white font-semibold">{userCoins}</div>
      </div>

      <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
        <div className="text-xs uppercase text-slate-500 font-bold">Acoes rapidas</div>
        <button
          type="button"
          onClick={() => onPurchaseSuccess(0)}
          className="mt-3 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold"
        >
          Simular compra
        </button>
      </div>
    </div>
  );
}
