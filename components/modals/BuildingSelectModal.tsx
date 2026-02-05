import React from 'react';
import { Box, Coins, Layout, X } from 'lucide-react';
import { BuildingData, BuildingType, Squad, User } from '../../types';
import { BUILD_COSTS, BUILDING_METADATA } from '../../constants';

interface BuildingSelectModalProps {
  buildings: BuildingData[];
  squads: Squad[];
  currentUser: User | null;
  targetBuildSquadId: string | null;
  isMaster: boolean;
  onClose: () => void;
  onSelectType: (type: BuildingType) => void;
}

export default function BuildingSelectModal({
  buildings,
  squads,
  currentUser,
  targetBuildSquadId,
  isMaster,
  onClose,
  onSelectType
}: BuildingSelectModalProps) {
  const targetSquad = targetBuildSquadId || currentUser?.squadId;
  const targetSquadName = squads.find((s) => s.id === targetSquad)?.name;

  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-auto">
      <div className="bg-slate-800 border-2 border-slate-600 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Layout size={24} className="text-blue-400" /> Funções Organizacionais (Construções)</h3>
            <p className="text-sm text-slate-400 mt-1">Este novo projeto será vinculado à Squad: <strong className="text-white">{targetSquadName}</strong></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(BuildingType)
            .filter((t) => t !== BuildingType.RESIDENTIAL && t !== BuildingType.SQUAD_HQ && t !== BuildingType.TRIBAL_CENTER && t !== BuildingType.DECORATION)
            .map((type) => {
              const meta = BUILDING_METADATA[type];
              if (!meta) return null;

              const isBuilt = buildings.some((b) => b.type === type && b.squadId === targetSquad);

              return (
                <button
                  key={type}
                  disabled={isBuilt && !isMaster}
                  onClick={() => onSelectType(type)}
                  className={`flex flex-col text-left border rounded-xl p-4 transition-all group h-full relative overflow-hidden ${isBuilt && !isMaster ? 'bg-slate-800 border-slate-700 opacity-60 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-indigo-500'}`}
                >
                  {isBuilt && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 pointer-events-none">
                      <div className="bg-red-900/90 text-red-100 font-bold px-3 py-1 rounded border border-red-500 transform -rotate-12 shadow-xl">JÁ CONSTRUÍDO</div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-3 rounded-full transition-transform ${isBuilt ? 'bg-slate-700' : 'bg-slate-800 group-hover:scale-110'}`}>
                      <Box size={24} className={isBuilt ? 'text-slate-500' : 'text-indigo-400'} />
                    </div>
                    <div>
                      <div className="font-bold text-white uppercase text-sm leading-tight">{meta.title}</div>
                      <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold mt-1">
                        <Coins size={12} /> {BUILD_COSTS[type].coins}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-3 line-clamp-2">{meta.description}</p>

                  <div className="mt-auto pt-3 border-t border-slate-600 w-full">
                    <span className="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Funções:</span>
                    <div className="flex flex-wrap gap-1">
                      {meta.functions.map((f) => (
                        <span key={f} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">{f}</span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
