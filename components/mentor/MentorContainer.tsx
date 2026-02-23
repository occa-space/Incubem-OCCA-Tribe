import React from 'react';
import { FeedbackEntry, Squad, User } from '../../types';
import { MessageSquare } from 'lucide-react';

interface MentorContainerProps {
  currentUser: User;
  users: User[];
  squads: Squad[];
  feedbacks: FeedbackEntry[];
  sprintCycle: number;
  onCreateDaily: () => void;
  onCreateFeedback: () => void;
}

export default function MentorContainer({ currentUser, users, squads, feedbacks, sprintCycle, onCreateDaily, onCreateFeedback }: MentorContainerProps) {
  const feedbacksReceived = feedbacks
    .filter((f) => f.targetUserId === currentUser.id)
    .sort((a, b) => b.timestamp - a.timestamp);

  const squadFeedbacks = feedbacks
    .filter((f) => f.squadId === currentUser.squadId)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  const getUserName = (id: string) => users.find((u) => u.id === id)?.name || 'Usuário';

  return (
    <div className="p-6 space-y-4">
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Mentoria</h2>
        <p className="text-slate-400 text-sm">
          Area de mentor em modularizacao. Sprint atual: <span className="font-mono text-indigo-300">{sprintCycle}</span>
        </p>
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={onCreateDaily}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Registrar Daily
          </button>
          <button
            type="button"
            onClick={onCreateFeedback}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
          >
            Registrar Feedback
          </button>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase mb-3 flex items-center gap-2">
            <MessageSquare size={14} className="text-emerald-400" /> Feedbacks Recebidos por Você
          </h3>
          {feedbacksReceived.length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhum feedback recebido ainda.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {feedbacksReceived.map((f) => (
                <div key={f.id} className="bg-slate-800/70 border border-slate-700 rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>De: <span className="text-slate-200 font-semibold">{getUserName(f.sourceUserId)}</span></span>
                    <span>Sprint {f.sprint}</span>
                  </div>
                  {f.q_comm && <p className="text-sm text-slate-200"><span className="text-slate-400">Comunicação:</span> {f.q_comm}</p>}
                  {f.q_impact && <p className="text-sm text-slate-200"><span className="text-slate-400">Impacto:</span> {f.q_impact}</p>}
                  {!f.q_comm && !f.q_impact && <p className="text-sm text-slate-300">Feedback registrado.</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase mb-3 flex items-center gap-2">
            <MessageSquare size={14} className="text-indigo-400" /> Feedbacks Recentes da Squad
          </h3>
          {squadFeedbacks.length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhum feedback na squad ainda.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {squadFeedbacks.map((f) => (
                <div key={f.id} className="bg-slate-800/70 border border-slate-700 rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>{getUserName(f.sourceUserId)} → {getUserName(f.targetUserId)}</span>
                    <span>Sprint {f.sprint}</span>
                  </div>
                  <div className="text-[11px] uppercase text-slate-500 mb-2">{f.relationship.replaceAll('_', ' ')}</div>
                  {f.q_comm && <p className="text-sm text-slate-200"><span className="text-slate-400">Comunicação:</span> {f.q_comm}</p>}
                  {f.q_impact && <p className="text-sm text-slate-200"><span className="text-slate-400">Impacto:</span> {f.q_impact}</p>}
                  {!f.q_comm && !f.q_impact && <p className="text-sm text-slate-300">Feedback registrado.</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
