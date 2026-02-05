import React from 'react';
import { User } from '../../types';

interface WarehouseViewProps {
  currentUser: User;
}

export default function WarehouseView({ currentUser }: WarehouseViewProps) {
  return (
    <div className="p-6 space-y-4">
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Armazem</h2>
        <p className="text-slate-400 text-sm">
          Area em modularizacao. Usuario: <span className="text-indigo-300 font-semibold">{currentUser.name}</span>
        </p>
      </div>
    </div>
  );
}
