import React from 'react';
import { Activity, Box, Database, Landmark, Shield, X } from 'lucide-react';
import { BuildingData, Squad, BuildingType } from '../../types';
import { BUILDING_METADATA } from '../../constants';

interface BuildingModalHeaderProps {
  selectedBuilding: BuildingData;
  buildingSquad: Squad | undefined;
  isMyHouse: boolean;
  isSquadHQ: boolean;
  isTribalCenter: boolean;
  plannedPA: number;
  concludedPA: number;
  concludedPercent: number;
  paLimit: number;
  onClose: () => void;
}

export default function BuildingModalHeader({
  selectedBuilding,
  buildingSquad,
  isMyHouse,
  isSquadHQ,
  isTribalCenter,
  plannedPA,
  concludedPA,
  concludedPercent,
  paLimit,
  onClose
}: BuildingModalHeaderProps) {
  return (
    <div className="flex flex-col p-4 bg-slate-900 border-b border-slate-700 gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            {selectedBuilding.type === BuildingType.SQUAD_HQ ? <Shield size={28} /> : selectedBuilding.type === BuildingType.TRIBAL_CENTER ? <Landmark size={28} /> : <Box size={28} />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white pixel-font leading-tight">
              {selectedBuilding.type === BuildingType.SQUAD_HQ
                ? (buildingSquad?.name || 'Squad HQ')
                : selectedBuilding.type === BuildingType.TRIBAL_CENTER
                ? 'Centro da Tribo (Guilda)'
                : isMyHouse ? 'Minha Base'
                : BUILDING_METADATA[selectedBuilding.type]?.title || 'Projeto'}
            </h2>
            {buildingSquad && !isTribalCenter && (
              <div className="text-sm font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-1">
                {buildingSquad.name}
                <span className="text-slate-500 font-normal normal-case ml-1">• Nível {selectedBuilding.level}</span>
              </div>
            )}
            {isTribalCenter && <div className="text-sm text-yellow-500 font-bold uppercase tracking-widest">Sede Administrativa</div>}
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X size={24} /></button>
      </div>

      {!isMyHouse && !isSquadHQ && !isTribalCenter && (
        <div className="flex gap-8 px-2">
          <div className="flex-1 opacity-90">
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
              <span className="flex items-center gap-1"><Activity size={12} /> PLANEJADO</span>
              <span className="text-blue-300">{plannedPA} PA</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
              <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (plannedPA / (paLimit || 100)) * 100)}%` }} />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
              <span className="flex items-center gap-1"><Database size={12} /> CONCLUÍDO (Capacidade: {paLimit})</span>
              <span className="text-green-400 font-bold">{concludedPA} PA</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
              <div
                className={`h-full transition-all duration-500 ${concludedPercent >= 100 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${concludedPercent}%` }}
              />
            </div>
            {concludedPercent >= 100 && <div className="text-[10px] text-red-400 mt-1 text-right font-bold animate-pulse">CAPACIDADE CHEIA!</div>}
          </div>
        </div>
      )}
    </div>
  );
}
