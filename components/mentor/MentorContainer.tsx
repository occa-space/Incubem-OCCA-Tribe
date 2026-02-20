import React from 'react';
import { Squad, User } from '../../types';

interface MentorContainerProps {
  currentUser: User;
  users: User[];
  squads: Squad[];
  sprintCycle: number;
}

export default function MentorContainer({ currentUser, users, squads, sprintCycle }: MentorContainerProps) {
  return (
    <div className="p-6 space-y-4">
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Mentoria</h2>
        <p className="text-slate-400 text-sm">
          Area de mentor em modularizacao. Sprint atual: <span className="font-mono text-indigo-300">{sprintCycle}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
          <div className="text-xs uppercase text-slate-500 font-bold">Usuario atual</div>
          <div className="text-white font-semibold mt-2">{currentUser.name}</div>
          <div className="text-slate-400 text-xs">{currentUser.role}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
          <div className="text-xs uppercase text-slate-500 font-bold">Squads</div>
          <div className="text-white font-semibold mt-2">{squads.length}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
          <div className="text-xs uppercase text-slate-500 font-bold">Usuarios</div>
          <div className="text-white font-semibold mt-2">{users.length}</div>
        </div>
      </div>
    </div>
  );
}
