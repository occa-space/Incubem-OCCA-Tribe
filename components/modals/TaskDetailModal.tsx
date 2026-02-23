import React from 'react';
import {
  Award,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  Calculator,
  FileText,
  History,
  Link as LinkIcon,
  Lock,
  Repeat,
  Users,
  X
} from 'lucide-react';
import { BuildingType, FixedTimeType, GameState, KanbanTask, TaskSize, TaskComplexity } from '../../types';
import { AIM_OPTIONS, BUILDING_METADATA, COMPLEXITY_LABELS, FIBONACCI_SIZES, RULE_DESCRIPTIONS, TASK_RULES } from '../../constants';

interface TaskDetailModalProps {
  editingTask: { buildingId: string; task: KanbanTask };
  isCreatingTask: boolean;
  taskModalTab: 1 | 2 | 3 | 4 | 5;
  setTaskModalTab: (tab: 1 | 2 | 3 | 4 | 5) => void;
  gameState: GameState;
  updateTask: (buildingId: string, taskId: string, updates: Partial<KanbanTask>) => void;
  handleTaskFieldUpdate: (updates: Partial<KanbanTask>, buildingIdOverride?: string) => void;
  handleSaveNewTask: () => void;
  confirmGrading: () => void;
  calculateTaskPA: (task: Partial<KanbanTask>) => number;
  setEditingTask: (value: { buildingId: string; task: KanbanTask } | null) => void;
  setIsCreatingTask: (value: boolean) => void;
  isMaster: boolean;
}

export default function TaskDetailModal({
  editingTask,
  isCreatingTask,
  taskModalTab,
  setTaskModalTab,
  gameState,
  updateTask,
  handleTaskFieldUpdate,
  handleSaveNewTask,
  confirmGrading,
  calculateTaskPA,
  setEditingTask,
  setIsCreatingTask,
  isMaster
}: TaskDetailModalProps) {
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-800 border-2 border-indigo-500/50 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900 rounded-t-xl">
          <div className="flex items-center gap-3 w-full mr-4">
            <div className="bg-indigo-600 p-2 rounded shrink-0"><ClipboardList size={20} className="text-white" /></div>
            <div className="w-full">
              <input
                className="bg-transparent text-xl font-bold text-white focus:outline-none focus:border-b border-indigo-500 w-full placeholder-slate-500"
                value={editingTask.task.content}
                onChange={(e) => handleTaskFieldUpdate({ content: e.target.value })}
                placeholder={isCreatingTask ? 'Escreva o título da nova tarefa...' : 'Título da Tarefa'}
                autoFocus={isCreatingTask}
              />
              {!isCreatingTask && (
                <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">{editingTask.task.status} • {gameState.squads.find((s) => s.id === editingTask.task.squadId)?.name}</div>
              )}
            </div>
          </div>
          <button onClick={() => { setEditingTask(null); setIsCreatingTask(false); }} className="p-2 hover:bg-slate-700 rounded-full"><X /></button>
        </div>

        <div className="flex border-b border-slate-700 bg-slate-800">
          <button onClick={() => setTaskModalTab(1)} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${taskModalTab === 1 ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}`}><FileText size={16} /> Detalhes</button>
          {!isCreatingTask && (
            <>
              <button onClick={() => setTaskModalTab(2)} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${taskModalTab === 2 ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}`}><Users size={16} /> Equipe</button>
              <button onClick={() => setTaskModalTab(3)} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${taskModalTab === 3 ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}`}><LinkIcon size={16} /> Evidências</button>
              <button onClick={() => setTaskModalTab(4)} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${taskModalTab === 4 ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}`}><Award size={16} /> Avaliação</button>
              <button onClick={() => setTaskModalTab(5)} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${taskModalTab === 5 ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}`}><History size={16} /> Histórico</button>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50">
          {taskModalTab === 1 && (
            <div className="space-y-6">
              {isCreatingTask && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Squad Responsável</label>
                    <select
                      className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white"
                      value={editingTask.task.squadId}
                      onChange={(e) => handleTaskFieldUpdate({ squadId: e.target.value })}
                    >
                      {gameState.squads.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Vincular a Projeto/Construção *</label>
                    <select
                      className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white"
                      value={editingTask.buildingId}
                      onChange={(e) => handleTaskFieldUpdate({}, e.target.value)}
                    >
                      <option value="">Selecione um projeto...</option>
                      {gameState.buildings
                        .filter((b) =>
                          b.squadId === editingTask.task.squadId &&
                          b.type !== BuildingType.RESIDENTIAL &&
                          b.type !== BuildingType.SQUAD_HQ &&
                          b.type !== BuildingType.TRIBAL_CENTER
                        )
                        .map((b) => (
                          <option key={b.id} value={b.id}>{BUILDING_METADATA[b.type]?.title || 'Projeto'} ({b.id.substring(b.id.length - 4)})</option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Descrição</label>
                <textarea
                  className="w-full h-32 bg-slate-800 border border-slate-600 rounded p-3 text-white text-sm"
                  placeholder="Descreva o que precisa ser feito..."
                  value={editingTask.task.description || ''}
                  onChange={(e) => handleTaskFieldUpdate({ description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tamanho (Fibonacci)</label>
                  <select
                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white"
                    value={editingTask.task.size}
                    onChange={(e) => handleTaskFieldUpdate({ size: Number(e.target.value) as TaskSize })}
                  >
                    {FIBONACCI_SIZES.filter((s) => s < 34).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-2">Regra: tarefas 34+ devem ser quebradas em menores.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Complexidade</label>
                  <select
                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white"
                    value={editingTask.task.complexity}
                    onChange={(e) => handleTaskFieldUpdate({ complexity: Number(e.target.value) as TaskComplexity })}
                  >
                    {[1, 2, 3].map((c) => <option key={c} value={c}>{COMPLEXITY_LABELS[c as TaskComplexity]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Regra</label>
                  <select
                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white"
                    value={editingTask.task.ruleValue}
                    onChange={(e) => {
                      const rule = TASK_RULES.find((r) => r.value === e.target.value);
                      if (rule) handleTaskFieldUpdate({ ruleValue: rule.value, ruleLabel: rule.label, ruleMultiplier: rule.multiplier });
                    }}
                  >
                    {TASK_RULES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>

              {editingTask.task.ruleValue === 'FIXED' && (
                <div className="p-4 bg-slate-800/50 rounded-lg border border-orange-500/30 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={() => handleTaskFieldUpdate({ fixedTimeType: 'DAILY', fixedQuantityLimit: undefined, fixedDeadline: Date.now() + 86400000 })}
                      className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 border-2 transition-all ${editingTask.task.fixedDeadline !== undefined && editingTask.task.fixedQuantityLimit === undefined ? 'bg-orange-600 border-orange-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                    >
                      <CalendarDays size={14} /> POR PERÍODO & PRAZO
                    </button>
                    <button
                      onClick={() => handleTaskFieldUpdate({ fixedQuantityLimit: 1, fixedDeadline: undefined, fixedTimeType: undefined })}
                      className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 border-2 transition-all ${editingTask.task.fixedQuantityLimit !== undefined ? 'bg-orange-600 border-orange-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                    >
                      <Repeat size={14} /> POR META (QTDE)
                    </button>
                  </div>

                  {editingTask.task.fixedDeadline !== undefined && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-2">
                      <div>
                        <label className="block text-[10px] font-bold text-orange-400 uppercase mb-1">Periodicidade</label>
                        <select
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                          value={editingTask.task.fixedTimeType || 'DAILY'}
                          onChange={(e) => handleTaskFieldUpdate({ fixedTimeType: e.target.value as FixedTimeType })}
                        >
                          <option value="DAILY">Diária</option>
                          <option value="WEEKLY">Semanal</option>
                          <option value="MONTHLY">Mensal</option>
                          <option value="CUSTOM">Personalizada</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-orange-400 uppercase mb-1">Data Limite (Até quando)</label>
                        <input
                          type="date"
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                          value={new Date(editingTask.task.fixedDeadline || Date.now()).toISOString().split('T')[0]}
                          onChange={(e) => handleTaskFieldUpdate({ fixedDeadline: new Date(e.target.value).getTime() })}
                        />
                      </div>
                    </div>
                  )}

                  {editingTask.task.fixedQuantityLimit !== undefined && (
                    <div className="animate-in fade-in slide-in-from-right-2">
                      <label className="block text-[10px] font-bold text-orange-400 uppercase mb-1">Meta (Número de Vezes)</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                        value={editingTask.task.fixedQuantityLimit || 1}
                        onChange={(e) => handleTaskFieldUpdate({ fixedQuantityLimit: parseInt(e.target.value, 10) || 1 })}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="bg-indigo-900/30 border border-indigo-900 p-4 rounded text-sm text-indigo-200">
                <div className="font-bold mb-1">ℹ️ Sobre a Regra selecionada:</div>
                {RULE_DESCRIPTIONS[editingTask.task.ruleValue || 'INTEGRATED']}
              </div>
              <div className="bg-slate-800 p-4 rounded border border-slate-700 flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-xs">PA Base Estimado (Sem AIM)</span>
                <span className="text-2xl font-bold text-white">{calculateTaskPA(editingTask.task)}</span>
              </div>

              {isCreatingTask && (
                <button
                  onClick={handleSaveNewTask}
                  className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                >
                  <Check size={24} /> Criar Tarefa
                </button>
              )}
            </div>
          )}

          {taskModalTab === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
              <div>
                <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Users size={16} /> Selecionar Participantes</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {gameState.users.map((u) => {
                    const isSelected = (editingTask.task.participants || [editingTask.task.creatorId]).includes(u.id);
                    return (
                      <div
                        key={u.id}
                        className={`p-3 rounded border flex items-center justify-between cursor-pointer transition-all ${isSelected ? 'bg-indigo-900/30 border-indigo-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                        onClick={() => {
                          const current = editingTask.task.participants || [editingTask.task.creatorId];
                          const newParticipants = isSelected ? current.filter((id) => id !== u.id) : [...current, u.id];
                          handleTaskFieldUpdate({ participants: newParticipants });
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-slate-700"
                            style={{ backgroundColor: u.color || '#4f46e5' }}
                          >
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-200 block">{u.name}</span>
                            <span className="text-[10px] text-slate-400">{gameState.squads.find((s) => s.id === u.squadId)?.name}</span>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 size={16} className="text-green-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex flex-col">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Calculator size={16} /> Distribuição de Pontos</h4>

                {editingTask.task.ruleValue === 'NEGOTIATED' ? (
                  <div className="space-y-4 flex-1">
                    <div className="bg-blue-900/30 border border-blue-500/50 p-3 rounded text-sm mb-2">
                      <p className="text-blue-200 text-xs">Regra <strong>Negociada</strong>: Distribua manualmente os pontos entre os participantes.</p>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase text-slate-400">Total PA Disponível</span>
                      <span className="text-xl font-bold text-white">{editingTask.task.size * editingTask.task.complexity}</span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                      {(editingTask.task.participants || [editingTask.task.creatorId]).map((userId) => {
                        const user = gameState.users.find((u) => u.id === userId);
                        const currentVal = editingTask.task.customPaDistribution?.[userId] || 0;
                        return (
                          <div key={userId} className="flex justify-between items-center bg-slate-900 p-2 rounded">
                            <span className="text-sm text-slate-300">{user?.name || userId}</span>
                            <input
                              type="number"
                              min="0"
                              className="w-16 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-right text-white text-sm"
                              value={currentVal}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                handleTaskFieldUpdate({
                                  customPaDistribution: {
                                    ...(editingTask.task.customPaDistribution || {}),
                                    [userId]: val
                                  }
                                });
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-600">
                      {(() => {
                        const totalAvailable = editingTask.task.size * editingTask.task.complexity;
                        const currentDistributed = (Object.values(editingTask.task.customPaDistribution || {}) as number[]).reduce((a, b) => a + b, 0);
                        const isMatch = currentDistributed === totalAvailable;
                        return (
                          <div className="flex justify-between items-center">
                            <span className="text-xs uppercase text-slate-400">Distribuído</span>
                            <span className="text-xl font-bold" style={{ color: isMatch ? '#22c55e' : '#ef4444' }}>
                              {currentDistributed} / {totalAvailable}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b border-slate-600 pb-2">
                      <span className="text-slate-400">Regra Atual</span>
                      <span className="font-bold text-indigo-300">{editingTask.task.ruleLabel}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-600 pb-2">
                      <span className="text-slate-400">Participantes</span>
                      <span className="font-bold text-white">{editingTask.task.participants?.length || 1}</span>
                    </div>
                    <div className="pt-2">
                      <div className="text-center mb-2 text-slate-400">Cada participante receberá:</div>
                      <div className="text-center text-3xl font-bold text-green-400">
                        {calculateTaskPA(editingTask.task)} <span className="text-sm text-slate-500">PA/Moedas</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 text-center italic mt-4">
                      *Valor final depende da nota AIM do mentor.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {taskModalTab === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Link da Entrega (Drive, Figma, Github...)</label>
                <div className="flex gap-2">
                  <div className="bg-slate-700 p-2 rounded text-slate-400"><LinkIcon size={18} /></div>
                  <input
                    className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 text-white text-sm"
                    placeholder="https://..."
                    value={editingTask.task.evidenceLink || ''}
                    onChange={(e) => handleTaskFieldUpdate({ evidenceLink: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Notas de Entrega</label>
                <textarea
                  className="w-full h-24 bg-slate-800 border border-slate-600 rounded p-3 text-white text-sm"
                  placeholder="Comentários sobre o que foi feito..."
                  value={editingTask.task.deliveryNotes || ''}
                  onChange={(e) => handleTaskFieldUpdate({ deliveryNotes: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Reflexões e Aprendizados</label>
                <textarea
                  className="w-full h-24 bg-slate-800 border border-slate-600 rounded p-3 text-white text-sm"
                  placeholder="O que aprendemos com essa tarefa?"
                  value={editingTask.task.reflections || ''}
                  onChange={(e) => handleTaskFieldUpdate({ reflections: e.target.value })}
                />
              </div>
            </div>
          )}

          {taskModalTab === 4 && (
            <div className="h-full">
              {editingTask.task.status === 'DONE' ? (
                <div className="text-center py-10">
                  <div className="inline-block p-4 bg-green-900/30 rounded-full mb-4">
                    <Award size={48} className="text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Tarefa Avaliada!</h3>
                  <p className="text-slate-400 mb-6">Esta tarefa foi concluída com sucesso.</p>

                  <div className="max-w-md mx-auto bg-slate-800 p-6 rounded-lg border border-slate-700 text-left space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nota AIM</span>
                      <span className="font-bold text-white">{editingTask.task.aim} / 3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Feedback</span>
                      <p className="text-sm text-slate-300 text-right max-w-[200px]">{editingTask.task.feedback || 'Sem feedback registrado.'}</p>
                    </div>
                    <div className="border-t border-slate-700 pt-4 flex justify-between items-center">
                      <span className="text-slate-400">Recompensa Final (Você)</span>
                      <div className="text-right">
                        <div className="text-xl font-bold text-yellow-400">{editingTask.task.finalCoins} Moedas</div>
                        <div className="text-xs text-indigo-400">{editingTask.task.finalXP} XP</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : editingTask.task.status === 'REVIEW' ? (
                <div className="max-w-lg mx-auto space-y-6">
                  <div className="bg-purple-900/20 border border-purple-500/50 p-4 rounded text-center">
                    <h4 className="font-bold text-purple-300">Tarefa em Revisão</h4>
                    <p className="text-xs text-purple-200 mt-1">
                      {isMaster
                        ? 'Como Senior/Master, avalie o impacto desta entrega para liberar as recompensas.'
                        : 'Aguardando avaliação do Senior/Master.'}
                    </p>
                  </div>

                  {isMaster ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Feedback do Mentor/Master</label>
                        <textarea
                          className="w-full h-24 bg-slate-800 border border-slate-600 rounded p-3 text-white text-sm"
                          placeholder="Pontos fortes e pontos de melhoria..."
                          value={editingTask.task.feedback || ''}
                          onChange={(e) => updateTask(editingTask.buildingId, editingTask.task.id, { feedback: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nota de Impacto (AIM)</label>
                        <div className="grid grid-cols-1 gap-2">
                          {AIM_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => updateTask(editingTask.buildingId, editingTask.task.id, { aim: option.value })}
                              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${editingTask.task.aim === option.value ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300'}`}
                            >
                              <span className="font-bold text-sm">{option.label}</span>
                              <span className="font-mono text-xs bg-black/20 px-2 py-1 rounded">x{option.multiplier}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={confirmGrading}
                        className="w-full mt-6 bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-lg shadow-lg flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={24} /> Confirmar Avaliação & Distribuir Recompensas
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500 border border-slate-700/50 rounded-lg bg-slate-900/30">
                      <Lock size={48} className="mb-4 text-purple-500/50" />
                      <p className="text-center max-w-xs font-bold">Avaliação bloqueada.</p>
                      <p className="text-center text-xs mt-2 max-w-xs">Apenas o usuário Senior/Master pode atribuir a nota AIM e liberar os pontos.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <Lock size={48} className="mb-4 opacity-50" />
                  <p className="text-center max-w-xs">A avaliação só fica disponível quando a tarefa está na coluna <strong>Para Revisão</strong>.</p>
                </div>
              )}
            </div>
          )}

          {taskModalTab === 5 && (
            <div className="h-full">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2"><History size={18} /> Histórico de Rotina</h4>
              {!editingTask.task.history || editingTask.task.history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                  <Clock size={48} className="mb-2 opacity-20" />
                  <p>Nenhuma rotina executada ainda.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-3">Data/Hora</th>
                        <th className="p-3">Participantes</th>
                        <th className="p-3 text-center">Sprint</th>
                        <th className="p-3 text-right">AIM</th>
                        <th className="p-3 text-right">XP</th>
                        <th className="p-3 text-right">Coins</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {editingTask.task.history.slice().reverse().map((entry, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-3 text-xs text-slate-300">
                            {new Date(entry.timestamp).toLocaleDateString()} <br />
                            <span className="text-slate-500">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex -space-x-2">
                              {entry.participants.map((pid) => {
                                const user = gameState.users.find((u) => u.id === pid);
                                return (
                                  <div key={pid} title={user?.name} className="w-6 h-6 rounded-full bg-indigo-600 border border-slate-900 flex items-center justify-center text-[8px] font-bold text-white uppercase">
                                    {user?.name.substring(0, 2)}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td className="p-3 text-center font-mono text-xs text-slate-400">{entry.sprint}</td>
                          <td className="p-3 text-right">
                            <span className={`font-bold ${entry.aim >= 2 ? 'text-green-400' : 'text-yellow-400'}`}>{entry.aim}</span>
                          </td>
                          <td className="p-3 text-right font-mono text-indigo-400">+{entry.xp}</td>
                          <td className="p-3 text-right font-mono text-yellow-500">+{entry.coins}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
