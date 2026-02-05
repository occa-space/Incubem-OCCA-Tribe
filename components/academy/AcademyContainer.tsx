import React from 'react';
import { GameState, User } from '../../types';

interface AcademyContainerProps {
  gameState: GameState;
  currentUser: User;
}

export default function AcademyContainer({ gameState, currentUser }: AcademyContainerProps) {
  const tracks = gameState.academyTracks || [];

  return (
    <div className="p-6 space-y-4">
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">OCCA Academy</h2>
        <p className="text-slate-400 text-sm">
          Area em modularizacao. Usuario: <span className="text-indigo-300 font-semibold">{currentUser.name}</span>
        </p>
      </div>

      <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
        <div className="text-xs uppercase text-slate-500 font-bold">Trilhas disponiveis</div>
        <div className="text-white font-semibold mt-2">{tracks.length}</div>
      </div>
    </div>
  );
}
