import React from 'react';
import { ChevronDown, Clock, Coins, LogOut, RefreshCcw } from 'lucide-react';
import { User } from '../../types';

interface HudProps {
  currentUser: User;
  playerLevel: number;
  sprintCycle: number;
  daysRemaining: number;
  coins: number;
  showProfileMenu: boolean;
  onToggleProfileMenu: () => void;
  onOpenSquadSelector: () => void;
  onStartNewSprint?: () => void;
  onResetSprint?: () => void;
  onLogout: () => void;
}

export default function Hud({
  currentUser,
  playerLevel,
  sprintCycle,
  daysRemaining,
  coins,
  showProfileMenu,
  onToggleProfileMenu,
  onOpenSquadSelector,
  onStartNewSprint,
  onResetSprint,
  onLogout
}: HudProps) {
  return (
    <div className="absolute top-0 left-0 w-full pointer-events-none z-10 flex flex-col items-center md:block">
      <div className="w-full flex justify-between items-center p-2 md:p-0 relative">
        <div className="pointer-events-auto relative md:absolute md:top-4 md:left-4 z-50">
          <div className="relative">
            <button
              onClick={onToggleProfileMenu}
              className="bg-slate-900/90 border-2 border-slate-600 rounded-full p-1 pr-4 shadow-xl backdrop-blur-md flex items-center gap-2 md:gap-3 hover:border-indigo-500 transition-colors scale-90 origin-top-left md:scale-100"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-indigo-600 border-2 border-slate-700 flex items-center justify-center text-sm font-bold text-white uppercase shadow-inner">
                {currentUser.name.substring(0, 2)}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[8px] md:text-[10px] uppercase font-bold text-slate-400">Nível</span>
                <span className="text-lg md:text-xl font-bold text-white leading-none">{playerLevel}</span>
              </div>
              <ChevronDown size={16} className={`text-slate-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {showProfileMenu && (
              <div className="absolute top-14 left-0 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-2 w-56 animate-in slide-in-from-top-2 fade-in duration-200">
                <button
                  onClick={onOpenSquadSelector}
                  className="w-full text-left p-3 hover:bg-slate-700 rounded-lg flex items-center gap-3 text-sm font-bold text-slate-300"
                >
                  <RefreshCcw size={18} /> Trocar Squad
                </button>
                {onStartNewSprint && (
                  <button
                    onClick={onStartNewSprint}
                    className="w-full text-left p-3 hover:bg-slate-700 rounded-lg flex items-center gap-3 text-sm font-bold text-emerald-300"
                  >
                    <Clock size={18} /> Iniciar Novo Sprint
                  </button>
                )}
                {onResetSprint && (
                  <button
                    onClick={onResetSprint}
                    className="w-full text-left p-3 hover:bg-slate-700 rounded-lg flex items-center gap-3 text-sm font-bold text-amber-300"
                  >
                    <RefreshCcw size={18} /> Resetar Sprint (0)
                  </button>
                )}
                <div className="h-px bg-slate-700 my-1"></div>
                <button onClick={onLogout} className="w-full text-left p-3 hover:bg-red-900/30 rounded-lg flex items-center gap-3 text-sm font-bold text-red-400">
                  <LogOut size={18} /> Sair
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="pointer-events-auto md:absolute md:top-4 md:left-1/2 md:transform md:-translate-x-1/2 z-30 flex justify-center">
          <div className="bg-slate-900/90 border-2 border-slate-600 rounded-full py-1.5 px-4 md:py-2 md:px-6 shadow-xl backdrop-blur-md flex items-center gap-3 scale-90 md:scale-100">
              <div className="flex flex-col items-center">
              <span className="text-[9px] md:text-[10px] font-bold text-pink-400 uppercase tracking-widest leading-none">Sprint {sprintCycle}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock size={14} className="text-slate-300 md:w-4 md:h-4" />
                <span className="text-sm md:text-lg font-bold text-white leading-none">{daysRemaining} dias</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto relative md:absolute md:top-4 md:right-4 z-40">
          <div className="bg-slate-900/90 border-2 border-slate-600 rounded-full py-1 px-4 md:py-2 md:px-6 shadow-xl backdrop-blur-md flex items-center gap-2 md:gap-3 h-10 md:h-[60px] scale-90 origin-top-right md:scale-100">
            <div className="bg-yellow-500 p-1 md:p-1.5 rounded-full shadow-inner">
              <Coins size={16} className="text-white md:w-5 md:h-5" />
            </div>
            <div className="text-yellow-400 font-mono font-bold text-lg md:text-xl">{coins.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
