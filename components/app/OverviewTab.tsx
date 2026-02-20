import React from 'react';
import {
  Activity,
  ArrowBigUp,
  CheckCircle2,
  FileText,
  Info,
  Move,
  Settings,
  Shield,
  Trash2,
  TrendingUp,
  Users,
  Box,
  Crown
} from 'lucide-react';
import { BuildingData, BuildingType, GameState, KanbanTask } from '../../types';
import { BUILDING_METADATA, getUpgradeCost } from '../../constants';

interface OverviewTabProps {
  isTribalCenter: boolean;
  selectedBuilding: BuildingData;
  gameState: GameState;
  displayTasks: KanbanTask[];
  dashboardTimeFilter: 'ALL' | number;
  onDashboardTimeFilterChange: (value: 'ALL' | number) => void;
  renderSprintChart: (chartData: Record<number, any>, currentSprint: number) => React.ReactNode;
  LocalTrophyIcon: React.ComponentType<{ size: number; className?: string }>;
  updateBuilding: (id: string, updates: Partial<BuildingData>) => void;
  isOwner: boolean;
  isMaster: boolean;
  upgradeSelected: () => void;
  onMoveSelected: () => void;
  onDeleteSelected: () => void;
  calculateTaskPA: (task: Partial<KanbanTask>) => number;
}

export default function OverviewTab({
  isTribalCenter,
  selectedBuilding,
  gameState,
  displayTasks,
  dashboardTimeFilter,
  onDashboardTimeFilterChange,
  renderSprintChart,
  LocalTrophyIcon,
  updateBuilding,
  isOwner,
  isMaster,
  upgradeSelected,
  onMoveSelected,
  onDeleteSelected,
  calculateTaskPA
}: OverviewTabProps) {
  return (
    <div className="p-8 h-full overflow-y-auto">
      {isTribalCenter ? (
        <div className="max-w-6xl mx-auto space-y-8">
          {(() => {
            const allTasks = gameState.buildings.flatMap((b) => b.tasks).filter((t) => t.status === 'DONE' || (t.history && t.history.length > 0));
            const totalGuildXP = allTasks.reduce((acc, t) => {
              const taskXP = t.finalXP || 0;
              const historyXP = (t.history || []).reduce((ha, he) => ha + he.xp, 0);
              return acc + taskXP + historyXP;
            }, 0);
            let guildLvl = 1;
            let nextLvlXP = 10000;
            let currentLvlXP = totalGuildXP;

            if (totalGuildXP >= 150000) {
              guildLvl = 4;
              currentLvlXP = totalGuildXP;
              nextLvlXP = 500000;
            } else if (totalGuildXP >= 50000) {
              guildLvl = 3;
              currentLvlXP = totalGuildXP - 50000;
              nextLvlXP = 100000;
            } else if (totalGuildXP >= 10000) {
              guildLvl = 2;
              currentLvlXP = totalGuildXP - 10000;
              nextLvlXP = 40000;
            }

            const progress = Math.min(100, (currentLvlXP / nextLvlXP) * 100);

            return (
              <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 flex items-center gap-6">
                <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center border-4 border-yellow-400 shadow-xl">
                  <Crown size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="text-2xl font-bold text-white uppercase">Nível da Guilda: {guildLvl}</h3>
                    <span className="text-sm font-mono text-yellow-400">{currentLvlXP.toLocaleString()} / {nextLvlXP.toLocaleString()} XP</span>
                  </div>
                  <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                    <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })()}

          {(() => {
            const allTasks = gameState.buildings.flatMap((b) => b.tasks);
            const plannedPA = allTasks.filter((t) => t.status !== 'DONE').reduce((acc, t) => acc + calculateTaskPA(t), 0);
            const totalCompletedPA = allTasks.reduce((acc, t) => {
              const currentPA = t.status === 'DONE' ? (t.finalPA || 0) : 0;
              const historyPA = (t.history || []).reduce((ha, he) => ha + he.coins, 0);
              return acc + currentPA + historyPA;
            }, 0);
            const ratedTasks = allTasks.filter((t) => t.status === 'DONE' && t.aim !== undefined);
            const avgRep = ratedTasks.length ? ratedTasks.reduce((acc, t) => acc + (t.aim || 0), 0) / ratedTasks.length : 0;

            return (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 border border-slate-600 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-400 font-bold mb-1 text-xs uppercase"><Activity size={16} /> Total PA Planejado</div>
                  <div className="text-2xl font-bold text-white">{plannedPA}</div>
                </div>
                <div className="bg-slate-800 border border-slate-600 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-400 font-bold mb-1 text-xs uppercase"><CheckCircle2 size={16} /> Total PA Concluído</div>
                  <div className="text-2xl font-bold text-white">{totalCompletedPA}</div>
                </div>
                <div className="bg-slate-800 border border-slate-600 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1 text-xs uppercase"><Shield size={16} /> Squads Ativas</div>
                  <div className="text-2xl font-bold text-white">{gameState.squads.length}</div>
                  <div className="text-xs text-slate-500">Reputação Média: {avgRep.toFixed(1)}</div>
                </div>
                <div className="bg-slate-800 border border-slate-600 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-purple-400 font-bold mb-1 text-xs uppercase"><Users size={16} /> Integrantes</div>
                  <div className="text-2xl font-bold text-white">{gameState.users.length}</div>
                </div>
              </div>
            );
          })()}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-slate-800 border border-slate-600 rounded-xl p-6 flex flex-col">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6"><TrendingUp size={20} className="text-indigo-400" /> Produtividade Global</h3>
              <div className="flex-1 min-h-[200px]">
                {(() => {
                  const sprintStats: Record<number, { pa: number; compSum: number; aimSum: number; count: number }> = {};
                  const allDone = gameState.buildings.flatMap((b) => b.tasks).filter((t) => t.status === 'DONE' || (t.history && t.history.length > 0));

                  allDone.forEach((t) => {
                    if (t.status === 'DONE') {
                      const lastSprintTag = t.sprintHistory?.[t.sprintHistory.length - 1] || 'Sprint 1';
                      const sprintNum = parseInt(lastSprintTag.replace('Sprint ', ''), 10) || 1;
                      if (!sprintStats[sprintNum]) sprintStats[sprintNum] = { pa: 0, compSum: 0, aimSum: 0, count: 0 };
                      sprintStats[sprintNum].pa += t.finalPA || 0;
                      sprintStats[sprintNum].compSum += t.complexity;
                      sprintStats[sprintNum].aimSum += t.aim || 0;
                      sprintStats[sprintNum].count++;
                    }
                    (t.history || []).forEach((he) => {
                      const sprintNum = he.sprint || 1;
                      if (!sprintStats[sprintNum]) sprintStats[sprintNum] = { pa: 0, compSum: 0, aimSum: 0, count: 0 };
                      sprintStats[sprintNum].pa += he.coins;
                      sprintStats[sprintNum].compSum += t.complexity;
                      sprintStats[sprintNum].aimSum += he.aim;
                      sprintStats[sprintNum].count++;
                    });
                  });

                  const chartData: Record<number, any> = {};
                  Object.keys(sprintStats).forEach((k) => {
                    const key = Number(k);
                    const d = sprintStats[key];
                    chartData[key] = {
                      pa: d.pa,
                      complexityAvg: d.count ? d.compSum / d.count : 0,
                      aimAvg: d.count ? d.aimSum / d.count : 0
                    };
                  });
                  return renderSprintChart(chartData, gameState.sprintCycle);
                })()}
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-800 border border-slate-600 rounded-xl p-6 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><LocalTrophyIcon size={20} className="text-yellow-400" /> Rankings da Tribo</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 uppercase font-bold">Período:</span>
                  <select
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    value={dashboardTimeFilter}
                    onChange={(e) => onDashboardTimeFilterChange(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                  >
                    <option value="ALL">Geral (Todos)</option>
                    {[...Array(gameState.sprintCycle)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>Sprint {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-300 uppercase mb-3 flex items-center gap-2"><Shield size={14} /> Top Squads</h4>
                  <div className="bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
                        <tr>
                          <th className="p-2">Squad</th>
                          <th className="p-2 text-right">PA</th>
                          <th className="p-2 text-right">AIM</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {gameState.squads
                          .filter((s) => s.id !== 'sq_board')
                          .map((s) => {
                            const squadTasks = gameState.buildings.filter((b) => b.squadId === s.id).flatMap((b) => b.tasks);
                            let totalPA = 0;
                            let aimSum = 0;
                            let count = 0;

                            squadTasks.forEach((t) => {
                              if (t.status === 'DONE' && (dashboardTimeFilter === 'ALL' || t.sprintHistory?.includes(`Sprint ${dashboardTimeFilter}`))) {
                                totalPA += t.finalPA || 0;
                                aimSum += t.aim || 0;
                                count++;
                              }
                              (t.history || []).forEach((he) => {
                                if (dashboardTimeFilter === 'ALL' || he.sprint === dashboardTimeFilter) {
                                  totalPA += he.coins;
                                  aimSum += he.aim;
                                  count++;
                                }
                              });
                            });

                            const avgAim = count ? aimSum / count : 0;
                            return { squad: s, totalPA, avgAim };
                          })
                          .sort((a, b) => b.totalPA - a.totalPA)
                          .map(({ squad, totalPA, avgAim }, idx) => (
                            <tr key={squad.id} className="hover:bg-slate-800/50">
                              <td className="p-2 flex items-center gap-2">
                                <span className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-400'}`}>{idx + 1}</span>
                                <span className="font-bold text-slate-200" style={{ color: squad.color }}>{squad.name}</span>
                              </td>
                              <td className="p-2 text-right font-mono text-green-400">{totalPA}</td>
                              <td className="p-2 text-right font-mono text-purple-400">{avgAim.toFixed(1)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-300 uppercase mb-3 flex items-center gap-2"><Users size={14} /> Top Integrantes</h4>
                  <div className="bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
                        <tr>
                          <th className="p-2">Nome</th>
                          <th className="p-2 text-right">PA</th>
                          <th className="p-2 text-right">AIM</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {gameState.users
                          .filter((u) => u.id !== 'u_senior')
                          .map((u) => {
                            let totalPA = 0;
                            let aimSum = 0;
                            let count = 0;

                            gameState.buildings.flatMap((b) => b.tasks).forEach((t) => {
                              const isPart = t.participants?.includes(u.id) || t.creatorId === u.id;
                              if (isPart && t.status === 'DONE' && (dashboardTimeFilter === 'ALL' || t.sprintHistory?.includes(`Sprint ${dashboardTimeFilter}`))) {
                                totalPA += t.finalPA || 0;
                                aimSum += t.aim || 0;
                                count++;
                              }
                              (t.history || []).forEach((he) => {
                                if (he.participants.includes(u.id) && (dashboardTimeFilter === 'ALL' || he.sprint === dashboardTimeFilter)) {
                                  totalPA += he.coins;
                                  aimSum += he.aim;
                                  count++;
                                }
                              });
                            });

                            const avgAim = count ? aimSum / count : 0;
                            return { user: u, totalPA, avgAim };
                          })
                          .sort((a, b) => b.totalPA - a.totalPA)
                          .map(({ user, totalPA, avgAim }, idx) => (
                            <tr key={user.id} className="hover:bg-slate-800/50">
                              <td className="p-2 flex items-center gap-2">
                                <span className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-400'}`}>{idx + 1}</span>
                                <span className="font-bold text-slate-200 truncate max-w-[80px]">{user.name}</span>
                              </td>
                              <td className="p-2 text-right font-mono text-green-400">{totalPA}</td>
                              <td className="p-2 text-right font-mono text-purple-400">{avgAim.toFixed(1)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <Info size={16} className="text-blue-400" /> Sobre esta Função
              </h3>
              <p className="text-sm text-slate-400 mb-4">{BUILDING_METADATA[selectedBuilding.type]?.description}</p>
              <div className="flex flex-wrap gap-1">
                {BUILDING_METADATA[selectedBuilding.type]?.functions.map((f) => (
                  <span key={f} className="text-[10px] bg-slate-700 px-2 py-1 rounded text-slate-200 font-bold uppercase">{f}</span>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col gap-4">
              <h3 className="font-bold text-white mb-1 flex items-center gap-2">
                <FileText size={16} className="text-indigo-400" /> Gestão do Projeto
              </h3>
              <div className="relative group flex-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block tracking-wider">Objetivo OCCA Específico</label>
                <textarea
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-slate-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none h-full min-h-[100px]"
                  placeholder="O que está sendo construído ou entregue neste prédio especificamente? (Ex: Protótipo do Novo Dashboard)"
                  value={selectedBuilding.description || ''}
                  onChange={(e) => updateBuilding(selectedBuilding.id, { description: e.target.value })}
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Settings size={14} className="text-slate-500" />
                </div>
              </div>
            </div>
          </div>

          {(isOwner || isMaster) && (
            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
              <div className="flex flex-col gap-3">
                <button onClick={upgradeSelected} className="w-full bg-green-600 hover:bg-green-500 p-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]">
                  <ArrowBigUp /> Evoluir Projeto ({isMaster ? '0 (Master)' : getUpgradeCost(selectedBuilding.level, selectedBuilding.type).coins + 'C'})
                </button>
                <div className="flex gap-3">
                  <button onClick={onMoveSelected} className="flex-1 bg-yellow-600 hover:bg-yellow-500 p-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-md">
                    <Move size={18} /> Mover
                  </button>
                  <button onClick={onDeleteSelected} className="flex-1 bg-red-600 hover:bg-red-500 p-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-md">
                    <Trash2 size={18} /> Demolir
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
