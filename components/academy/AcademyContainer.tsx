import React from 'react';
import { GameState, User } from '../../types';

interface AcademyContainerProps {
  gameState: GameState;
  currentUser: User;
  onCreateTrack: () => void;
}

export default function AcademyContainer({ gameState, currentUser, onCreateTrack }: AcademyContainerProps) {
  const tracks = gameState.academyTracks || [];

  return (
    <div className="p-6 space-y-4">
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">OCCA Academy</h2>
        <p className="text-slate-400 text-sm">
          Area em modularizacao. Usuario: <span className="text-indigo-300 font-semibold">{currentUser.name}</span>
        </p>
        <button
          type="button"
          onClick={onCreateTrack}
          className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
        >
          Criar Trilha
        </button>
      </div>

      <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
        <div className="text-xs uppercase text-slate-500 font-bold">Trilhas disponiveis</div>
        <div className="text-white font-semibold mt-2">{tracks.length}</div>
        <div className="mt-3 space-y-2">
          {tracks.map((t) => (
            <div key={t.id} className="text-xs text-slate-300">
              {t.title} — {t.status}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
