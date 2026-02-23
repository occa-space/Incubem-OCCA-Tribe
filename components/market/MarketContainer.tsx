import React from 'react';
import { MarketItem, User } from '../../types';

interface MarketContainerProps {
  currentUser: User;
  userCoins: number;
  items: MarketItem[];
  onPurchase: (item: MarketItem) => void;
}

export default function MarketContainer({ currentUser, userCoins, items, onPurchase }: MarketContainerProps) {
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
        <div className="text-xs uppercase text-slate-500 font-bold">Itens</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {items.filter((i) => i.isActive).map((item) => (
            <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex justify-between items-center">
              <div>
                <div className="text-white font-semibold">{item.name}</div>
                <div className="text-xs text-slate-400">{item.description}</div>
                <div className="text-xs text-amber-300 mt-1">Custo: {item.cost} | Estoque: {item.stock}</div>
              </div>
              <button
                type="button"
                disabled={item.stock <= 0 || userCoins < item.cost}
                onClick={() => onPurchase(item)}
                className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold"
              >
                Comprar
              </button>
            </div>
          ))}
          {items.filter((i) => i.isActive).length === 0 && (
            <div className="text-xs text-slate-500">Sem itens disponíveis.</div>
          )}
        </div>
      </div>
    </div>
  );
}
