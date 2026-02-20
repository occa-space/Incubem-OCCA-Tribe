import React from 'react';
import { Calendar, Plus, Repeat } from 'lucide-react';
import { BuildingData, GameState, KanbanStatus, KanbanTask } from '../../types';
import { BUILDING_METADATA } from '../../constants';

interface KanbanTabProps {
  isMyHouse: boolean;
  isSquadHQ: boolean;
  selectedBuilding: BuildingData;
  displayTasks: KanbanTask[];
  kanbanColumns: { id: KanbanStatus; label: string; color: string }[];
  swimlanes: { id: string; label: string; rule: string; color: string; icon: any }[];
  calculateTaskPA: (task: Partial<KanbanTask>) => number;
  onOpenCreateTask: (buildingId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: KanbanStatus) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onSelectTask: (buildingId: string, task: KanbanTask) => void;
  draggedTaskId: string | null;
  gameState: GameState;
}

export default function KanbanTab({
  isMyHouse,
  isSquadHQ,
  selectedBuilding,
  displayTasks,
  kanbanColumns,
  swimlanes,
  calculateTaskPA,
  onOpenCreateTask,
  onDragOver,
  onDrop,
  onDragStart,
  onSelectTask,
  draggedTaskId,
  gameState
}: KanbanTabProps) {
  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-auto">
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-end shrink-0">
        {!isMyHouse && (
          <button
            onClick={() => onOpenCreateTask(selectedBuilding.id)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-colors"
          >
            <Plus size={18} /> Nova Tarefa
          </button>
        )}
      </div>

      <div className="flex-1 p-4 min-w-max">
        <div className="flex gap-4 mb-4 ml-60">
          {kanbanColumns.map((col) => (
            <div key={col.id} className={`w-80 p-3 rounded-t-lg border-b-2 border-white/10 ${col.color.replace('/50', '/40')} text-white font-bold text-sm uppercase text-center shadow-sm`}>
              {col.label}
            </div>
          ))}
        </div>

        <div className="space-y-8">
          {swimlanes.map((lane) => (
            <div key={lane.id} className="relative bg-slate-800/20 rounded-xl border border-slate-700/50 pb-4">
              <div className="absolute left-0 top-0 bottom-0 w-56 flex flex-col items-center justify-center p-4 border-r border-slate-700 bg-slate-800/40 rounded-l-xl z-10">
                <div className={`p-3 rounded-full bg-slate-900 mb-3 border border-slate-700 ${lane.color}`}>
                  <lane.icon size={24} />
                </div>
                <h3 className={`text-center font-black uppercase tracking-widest text-sm ${lane.color}`}>{lane.label}</h3>
                <div className="text-[10px] text-slate-500 mt-2 font-bold uppercase">Regra: {lane.rule}</div>
              </div>

              <div className="flex gap-4 ml-60">
                {kanbanColumns.map((col) => {
                  const laneTasks = displayTasks.filter((t) => t.status === col.id && t.ruleValue === lane.rule);
                  const lanePA = laneTasks.reduce((acc, t) => acc + calculateTaskPA(t), 0);

                  return (
                    <div
                      key={`${lane.id}-${col.id}`}
                      className="w-80 min-h-[120px] flex flex-col bg-slate-900/30 rounded-lg border border-slate-800 p-2 transition-colors relative"
                      onDragOver={onDragOver}
                      onDrop={(e) => onDrop(e, col.id)}
                    >
                      {laneTasks.length > 0 && (
                        <div className="absolute -top-3 right-2 bg-slate-800 text-[9px] px-1.5 py-0.5 rounded text-slate-400 font-mono border border-slate-700 z-10">
                          PA: {lanePA}
                        </div>
                      )}

                      <div className="space-y-2">
                        {laneTasks.map((task) => {
                          const originBuilding = (isMyHouse || isSquadHQ) ? gameState.buildings.find((b) => b.id === (task as any).originalBuildingId) : null;
                          const originTitle = originBuilding ? (BUILDING_METADATA[originBuilding.type]?.title || 'Projeto') : null;

                          return (
                            <div
                              key={task.id}
                              draggable={col.id !== 'DONE'}
                              onDragStart={(e) => onDragStart(e, task.id)}
                              onClick={() => onSelectTask((task as any).originalBuildingId || selectedBuilding.id, task)}
                              className={`bg-slate-800 p-3 rounded border border-slate-700 shadow-sm relative group cursor-grab active:cursor-grabbing hover:border-indigo-500 transition-all ${draggedTaskId === task.id ? 'opacity-40 border-dashed border-slate-400' : ''}`}
                            >
                              <p className="text-sm text-slate-200 font-medium leading-snug mb-2">{task.content}</p>

                              <div className="flex flex-wrap gap-1 mb-2">
                                <span className="text-[9px] bg-slate-900 px-1.5 rounded border border-slate-700 text-slate-400">PA: {calculateTaskPA(task)}</span>
                                {task.ruleValue === 'FIXED' && task.fixedTimeType && (
                                  <span className="text-[9px] bg-orange-900/40 text-orange-300 px-1.5 rounded border border-orange-800/50 flex items-center gap-0.5">
                                    <Calendar size={8} /> {task.fixedTimeType === 'DAILY' ? 'D' : task.fixedTimeType === 'WEEKLY' ? 'S' : task.fixedTimeType === 'MONTHLY' ? 'M' : 'P'}
                                  </span>
                                )}
                                {task.ruleValue === 'FIXED' && (task.fixedQuantityLimit || task.fixedQuantity) && (
                                  <span className="text-[9px] bg-orange-900/40 text-orange-300 px-1.5 rounded border border-orange-800/50 flex items-center gap-0.5">
                                    <Repeat size={8} /> {task.fixedQuantityCount || 0}/{task.fixedQuantityLimit || task.fixedQuantity}x
                                  </span>
                                )}
                                {task.ruleValue === 'FIXED' && task.fixedDeadline && (
                                  <span className="text-[9px] bg-red-900/40 text-red-300 px-1.5 rounded border border-red-800/50 flex items-center gap-0.5">
                                    <Calendar size={8} /> {new Date(task.fixedDeadline).toLocaleDateString()}
                                  </span>
                                )}
                                {(isMyHouse || isSquadHQ) && (
                                  <span className="text-[9px] bg-indigo-900/40 text-indigo-300 px-1.5 rounded border border-indigo-800/50">
                                    {originTitle || 'Projeto'}
                                  </span>
                                )}
                              </div>

                              <div className="flex -space-x-1.5 mt-2 overflow-hidden">
                                {task.participants?.map((pid) => {
                                  const user = gameState.users.find((u) => u.id === pid);
                                  if (!user) return null;
                                  return (
                                    <div
                                      key={pid}
                                      title={user.name}
                                      className="w-5 h-5 rounded-full border border-slate-900 flex items-center justify-center text-[8px] font-bold text-white uppercase shadow-sm ring-1 ring-slate-800"
                                      style={{ backgroundColor: user.color || '#4f46e5' }}
                                    >
                                      {user.name.substring(0, 1)}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                        {laneTasks.length === 0 && (
                          <div className="h-full flex items-center justify-center opacity-10 pointer-events-none py-8">
                            <div className="border-2 border-dashed border-slate-400 w-full h-full rounded-lg"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
