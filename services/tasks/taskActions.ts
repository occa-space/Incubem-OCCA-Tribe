import { Dispatch, SetStateAction } from 'react';
import { AIM_OPTIONS, BUILDING_PA_LIMITS, calculateNextLevelXP } from '../../constants';
import { BuildingType, GameState, KanbanStatus, KanbanTask, TaskHistoryEntry } from '../../types';
import { createTask, deleteTask as deleteTaskRemote, updateTask as updateTaskRemote } from '../supabase/repositories/tasks';
import { supabase } from '../supabase/client';

export interface TaskActionsParams {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  editingTask: { buildingId: string; task: KanbanTask } | null;
  setEditingTask: Dispatch<SetStateAction<{ buildingId: string; task: KanbanTask } | null>>;
  isCreatingTask: boolean;
  setIsCreatingTask: Dispatch<SetStateAction<boolean>>;
  setTaskModalTab: Dispatch<SetStateAction<1 | 2 | 3 | 4 | 5>>;
  setIsMainMenuOpen: Dispatch<SetStateAction<boolean>>;
  setDraggedTaskId: Dispatch<SetStateAction<string | null>>;
  setRenewalPrompt: Dispatch<SetStateAction<{ buildingId: string; taskId: string; type: 'QUANTITY' | 'TIME' } | null>>;
  renewalPrompt: { buildingId: string; taskId: string; type: 'QUANTITY' | 'TIME' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const createTaskActions = ({
  gameState,
  setGameState,
  editingTask,
  setEditingTask,
  isCreatingTask,
  setIsCreatingTask,
  setTaskModalTab,
  setIsMainMenuOpen,
  setDraggedTaskId,
  setRenewalPrompt,
  renewalPrompt,
  showToast
}: TaskActionsParams) => {
  const canGrade = gameState.currentUser?.role === 'Master' || gameState.currentUser?.role === 'Mentor Júnior';
  const handleOpenCreateTask = (preselectedBuildingId?: string) => {
    if (!gameState.currentUser) return;

    // Restriction: Block creating tasks in Squad HQ if no other projects exist
    if (gameState.selectedBuildingId && !preselectedBuildingId) {
      const currentBuilding = gameState.buildings.find((b) => b.id === gameState.selectedBuildingId);
      if (currentBuilding && currentBuilding.type === BuildingType.SQUAD_HQ) {
        const squadProjects = gameState.buildings.filter(
          (b) => b.squadId === currentBuilding.squadId && b.type !== BuildingType.SQUAD_HQ && b.type !== BuildingType.RESIDENTIAL
        );

        if (squadProjects.length === 0) {
          showToast('Crie um Projeto (Construção) antes de criar tarefas na Squad HQ.', 'error');
          return;
        }
      }
    }

    // Determine context
    let initialSquadId = gameState.currentUser.squadId;
    let initialBuildingId = preselectedBuildingId || '';

    // If opening from inside a building, lock context
    if (gameState.selectedBuildingId && !preselectedBuildingId) {
      const b = gameState.buildings.find((bld) => bld.id === gameState.selectedBuildingId);
      if (b) {
        initialSquadId = b.squadId || gameState.currentUser.squadId;
        initialBuildingId = b.id;
      }
    }

    // If passed specific ID (from Kanban "+")
    if (preselectedBuildingId) {
      const b = gameState.buildings.find((bld) => bld.id === preselectedBuildingId);
      if (b) initialSquadId = b.squadId || gameState.currentUser.squadId;
    }

    // FIX: Ensure initial building is a valid functional project (Not HQ, Not Base)
    // If the context was HQ or Base, reset to empty so validation blocks saving and forces selection
    if (initialBuildingId) {
      const b = gameState.buildings.find((bld) => bld.id === initialBuildingId);
      if (b && (b.type === BuildingType.SQUAD_HQ || b.type === BuildingType.RESIDENTIAL)) {
        initialBuildingId = '';
      }
    }

    // Draft Task
    const draftTask: KanbanTask = {
      id: crypto.randomUUID(),
      content: '',
      status: 'BACKLOG',
      createdAt: Date.now(),
      creatorId: gameState.currentUser.id,
      assigneeId: gameState.currentUser.id,
      squadId: initialSquadId,
      size: 1,
      complexity: 1,
      ruleMultiplier: 1,
      ruleLabel: 'Integrada (I)',
      ruleValue: 'INTEGRATED',
      participants: [gameState.currentUser.id],
      customPaDistribution: {},
      sprintHistory: [],
      history: []
    };

    setIsCreatingTask(true);
    setEditingTask({ buildingId: initialBuildingId, task: draftTask });
    setTaskModalTab(1);
    setIsMainMenuOpen(false);
  };

  const handleSaveNewTask = () => {
    if (!editingTask || !gameState.currentUser) return;

    if (!editingTask.task.content.trim()) {
      showToast('A tarefa precisa de um título/descrição.', 'error');
      return;
    }
    if (editingTask.task.size >= 34) {
      showToast('Tasks 34+ devem ser quebradas em menores.', 'error');
      return;
    }
    if (!editingTask.buildingId) {
      showToast('Selecione um projeto/construção para vincular esta tarefa.', 'error');
      return;
    }

    // Add to global state
    setGameState((prev) => ({
      ...prev,
      buildings: prev.buildings.map((b) =>
        b.id === editingTask.buildingId ? { ...b, tasks: [...b.tasks, editingTask.task] } : b
      )
    }));
    void createTask(editingTask.buildingId, editingTask.task).catch(() => {
      showToast('Erro ao salvar tarefa.', 'error');
    });

    // Close
    setEditingTask(null);
    setIsCreatingTask(false);
    showToast('Tarefa criada com sucesso!', 'success');
  };

  // Wrapper for updating draft OR global state
  const handleTaskFieldUpdate = (updates: Partial<KanbanTask>, newBuildingId?: string) => {
    if (!editingTask) return;
    if (updates.size !== undefined && updates.size >= 34) {
      showToast('Tasks 34+ devem ser quebradas em menores.', 'error');
      return;
    }

    if (isCreatingTask) {
      // Update draft state only
      setEditingTask((prev) => {
        if (!prev) return null;
        return {
          buildingId: newBuildingId !== undefined ? newBuildingId : prev.buildingId,
          task: { ...prev.task, ...updates }
        };
      });
    } else {
      // Update global state immediately (Editing Mode)
      updateTask(editingTask.buildingId, editingTask.task.id, updates);
    }
  };

  const updateTask = (buildingId: string, taskId: string, updates: Partial<KanbanTask>) => {
    if (updates.status === 'DONE' && !canGrade) {
      showToast('Apenas Mentor ou Master podem concluir tarefas.', 'error');
      return;
    }
    setGameState((prev) => ({
      ...prev,
      buildings: prev.buildings.map((b) =>
        b.id === buildingId ? { ...b, tasks: b.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)) } : b
      )
    }));
    void updateTaskRemote(taskId, updates).catch(() => {
      showToast('Erro ao atualizar tarefa.', 'error');
    });
    // Sync local state if currently open (to avoid flickering)
    if (editingTask && editingTask.task.id === taskId && !isCreatingTask) {
      setEditingTask((prev) => (prev ? { ...prev, task: { ...prev.task, ...updates } } : null));
    }
  };

  const moveTask = (e: React.MouseEvent | null, task: KanbanTask, targetCol: KanbanStatus, buildingId: string) => {
    if (e) e.stopPropagation();
    if (targetCol === 'DONE' && !canGrade) {
      showToast('Apenas Mentor ou Master podem concluir tarefas.', 'error');
      return;
    }
    const currentSprintName = `Sprint ${gameState.sprintCycle}`;
    let newSprintHistory = task.sprintHistory || [];
    if (task.status === 'BACKLOG' && targetCol !== 'BACKLOG') {
      if (!newSprintHistory.includes(currentSprintName)) {
        newSprintHistory = [...newSprintHistory, currentSprintName];
      }
    }
    updateTask(buildingId, task.id, {
      status: targetCol,
      sprintHistory: newSprintHistory
    });
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, targetCol: KanbanStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    // Find building containing task (might not be selectedBuilding if viewing HQ aggregate)
    let targetBuildingId = gameState.selectedBuildingId || '';
    let foundTask: KanbanTask | undefined;

    // First check selected building
    const selectedB = gameState.buildings.find((b) => b.id === gameState.selectedBuildingId);
    foundTask = selectedB?.tasks.find((t) => t.id === taskId);

    // If aggregate view (HQ or House), we might need to search all buildings
    if (!foundTask) {
      for (const b of gameState.buildings) {
        const t = b.tasks.find((task) => task.id === taskId);
        if (t) {
          foundTask = t;
          targetBuildingId = b.id;
          break;
        }
      }
    }

    if (foundTask && foundTask.status !== targetCol && targetBuildingId) {
      moveTask(null, foundTask, targetCol, targetBuildingId);
    }
    setDraggedTaskId(null);
  };

  const confirmGrading = () => {
    if (!editingTask || !gameState.currentUser) return;
    if (!canGrade) {
      showToast('Apenas Mentor ou Master podem concluir tarefas.', 'error');
      return;
    }
    const { buildingId, task } = editingTask;

    const building = gameState.buildings.find((b) => b.id === buildingId);
    if (!building) return;

    // Calculate current Conclusion PA INCLUDING HISTORY for limit check
    const ConclusionPAWithHistory = building.tasks.reduce((acc, t) => {
      const currentDone = t.status === 'DONE' ? t.finalPA || 0 : 0;
      const historySum = (t.history || []).reduce((hAcc, hEntry) => hAcc + hEntry.coins, 0);
      return acc + currentDone + historySum;
    }, 0);

    const paLimit = BUILDING_PA_LIMITS[building.level] || 99999;

    let totalTaskPA = Math.floor(task.size * task.complexity * task.ruleMultiplier);

    if (task.ruleValue === 'NEGOTIATED') {
      const distribution = task.customPaDistribution || {};
      const sum = Object.values(distribution).reduce((acc, v) => acc + (v || 0), 0);
      if (sum !== totalTaskPA) {
        showToast('A soma do PA negociado deve ser igual ao PA total.', 'error');
        return;
      }
    }

    if (ConclusionPAWithHistory + totalTaskPA > paLimit) {
      showToast(`Capacidade de armazenamento atingida! (${ConclusionPAWithHistory}/${paLimit} PA)`, 'error');
      return;
    }

    const aimValue = task.aim !== undefined ? task.aim : 1;
    const aimOption = AIM_OPTIONS.find((o) => o.value === aimValue);
    const aimMultiplier = aimOption?.multiplier || 0;

    const participants = task.participants && task.participants.length > 0 ? task.participants : [gameState.currentUser.id];
    const participantRewards = new Map<string, { finalPA: number; xp: number; coins: number }>();

    for (const participantId of participants) {
      const basePA = task.ruleValue === 'NEGOTIATED'
        ? (task.customPaDistribution?.[participantId] || 0)
        : totalTaskPA;
      const finalPA = Math.floor(basePA * aimMultiplier);
      if (finalPA <= 0) continue;
      participantRewards.set(participantId, {
        finalPA,
        xp: finalPA * 10,
        coins: finalPA
      });
    }

    if (participantRewards.size === 0) {
      showToast('Nenhum participante com recompensa válida para esta tarefa.', 'error');
      return;
    }

    const totalFinalPA = Math.floor(totalTaskPA * aimMultiplier);
    const totalFinalXP = totalFinalPA * 10;
    const totalFinalCoins = totalFinalPA;
    const myReward = participantRewards.get(gameState.currentUser.id);

    // Routine History Entry
    const historyEntry: TaskHistoryEntry = {
      timestamp: Date.now(),
      aim: aimValue,
      xp: totalFinalXP,
      coins: totalFinalCoins,
      participants: Array.from(participantRewards.keys()),
      feedback: task.feedback,
      sprint: gameState.sprintCycle
    };

    let nextPlayer = { ...gameState.player };
    let nextResources = { ...gameState.resources };

    if (myReward) {
      const newTotalPA = gameState.player.totalPA + myReward.finalPA;
      let newXP = gameState.player.currentXP + myReward.xp;
      let newLevel = gameState.player.level;
      let newNextLevelXP = gameState.player.nextLevelXP;

      while (newXP >= newNextLevelXP) {
        newXP -= newNextLevelXP;
        newLevel++;
        newNextLevelXP = calculateNextLevelXP(newLevel);
      }
      const newRep = gameState.player.reputation * 0.95 + aimValue * 0.05;

      nextPlayer = {
        ...gameState.player,
        level: newLevel,
        currentXP: newXP,
        nextLevelXP: newNextLevelXP,
        totalPA: newTotalPA,
        reputation: newRep
      };
      nextResources = {
        coins: gameState.resources.coins + myReward.coins
      };
    }

    const isFixed = task.ruleValue === 'FIXED';
    const newCount = isFixed ? (task.fixedQuantityCount || 0) + 1 : 0;
    let limitReached = false;
    let limitType: 'QUANTITY' | 'TIME' = 'QUANTITY';

    if (isFixed) {
      if (task.fixedQuantityLimit && newCount >= task.fixedQuantityLimit) {
        limitReached = true;
        limitType = 'QUANTITY';
      }
      if (task.fixedDeadline && Date.now() >= task.fixedDeadline) {
        limitReached = true;
        limitType = 'TIME';
      }
    }

    if (limitReached) {
      setRenewalPrompt({ buildingId, taskId: task.id, type: limitType });
    }

    const nextStatus: KanbanStatus = isFixed && !limitReached ? 'BACKLOG' : 'DONE';

    const updatedTask: Partial<KanbanTask> = {
      status: nextStatus,
      aim: aimValue,
      finalPA: totalFinalPA,
      finalXP: totalFinalXP,
      finalCoins: totalFinalCoins,
      fixedQuantityCount: newCount,
      history: [...(task.history || []), historyEntry]
    };

    if (isFixed && !limitReached) {
      updatedTask.aim = undefined;
      updatedTask.feedback = undefined;
      updatedTask.evidenceLink = undefined;
      updatedTask.deliveryNotes = undefined;
      updatedTask.reflections = undefined;
      updatedTask.finalPA = undefined;
      updatedTask.finalXP = undefined;
      updatedTask.finalCoins = undefined;
    }

    setGameState((prev) => ({
      ...prev,
      player: nextPlayer,
      resources: nextResources,
      buildings: prev.buildings.map((b) => {
        if (b.id === buildingId) {
          return {
            ...b,
            tasks: b.tasks.map((t) => (t.id === task.id ? { ...t, ...updatedTask } : t))
          };
        }
        return b;
      })
    }));

    const dbUpdates: Partial<KanbanTask> & Record<string, any> = {
      ...updatedTask,
      aim: updatedTask.aim ?? (isFixed && !limitReached ? null : aimValue),
      finalPA: updatedTask.finalPA ?? (isFixed && !limitReached ? null : totalFinalPA),
      finalXP: updatedTask.finalXP ?? (isFixed && !limitReached ? null : totalFinalXP),
      finalCoins: updatedTask.finalCoins ?? (isFixed && !limitReached ? null : totalFinalCoins),
      feedback: updatedTask.feedback ?? (isFixed && !limitReached ? null : task.feedback),
      evidenceLink: updatedTask.evidenceLink ?? (isFixed && !limitReached ? null : task.evidenceLink),
      deliveryNotes: updatedTask.deliveryNotes ?? (isFixed && !limitReached ? null : task.deliveryNotes),
      reflections: updatedTask.reflections ?? (isFixed && !limitReached ? null : task.reflections)
    };
    void updateTaskRemote(task.id, dbUpdates as Partial<KanbanTask>).catch(() => {
      showToast('Erro ao salvar avaliação.', 'error');
    });

    const rewardsToPersist = Array.from(participantRewards.entries());
    void Promise.all(
      rewardsToPersist.map(async ([userId, reward]) => {
        const { error } = await supabase.rpc('apply_participant_rewards', {
          target_user: userId,
          pa_delta: reward.finalPA,
          xp_delta: reward.xp,
          coins_delta: reward.coins,
          aim_value: aimValue
        });
        if (error) throw error;
      })
    ).catch(() => {
      showToast('Erro ao distribuir recompensas para todos os participantes.', 'error');
    });

    setEditingTask(null);
    showToast(task.ruleValue === 'FIXED' ? 'Ciclo de rotina concluído!' : 'Avaliação concluída!', 'success');
  };

  const handleRenewal = (renew: boolean) => {
    if (!renewalPrompt) return;
    const { buildingId, taskId, type } = renewalPrompt;

    setGameState((prev) => ({
      ...prev,
      buildings: prev.buildings.map((b) => {
        if (b.id === buildingId) {
          return {
            ...b,
            tasks: b.tasks.map((t) => {
              if (t.id === taskId) {
                if (renew) {
                  // Reset count or extend deadline to some default (e.g., +1 week)
                  return {
                    ...t,
                    status: 'BACKLOG',
                    fixedQuantityCount: 0,
                    fixedDeadline: type === 'TIME' ? Date.now() + 7 * 24 * 60 * 60 * 1000 : t.fixedDeadline,
                    // Clear ephemeral fields
                    aim: undefined,
                    feedback: undefined,
                    evidenceLink: undefined,
                    deliveryNotes: undefined,
                    reflections: undefined,
                    finalPA: undefined,
                    finalXP: undefined,
                    finalCoins: undefined
                  };
                }
                return { ...t, status: 'DONE' };
              }
              return t;
            })
          };
        }
        return b;
      })
    }));
    void updateTaskRemote(taskId, {
      status: renew ? 'BACKLOG' : 'DONE',
      fixedQuantityCount: renew ? 0 : undefined,
      fixedDeadline: type === 'TIME' && renew ? Date.now() + 7 * 24 * 60 * 60 * 1000 : undefined,
      aim: undefined,
      feedback: undefined,
      evidenceLink: undefined,
      deliveryNotes: undefined,
      reflections: undefined,
      finalPA: undefined,
      finalXP: undefined,
      finalCoins: undefined
    }).catch(() => {
      showToast('Erro ao salvar renovação.', 'error');
    });

    setRenewalPrompt(null);
    showToast(renew ? 'Tarefa renovada e movida para o Backlog!' : 'Tarefa finalizada permanentemente.', 'info');
  };

  const deleteTask = (buildingId: string, taskId: string) => {
    const building = gameState.buildings.find((b) => b.id === buildingId);
    const task = building?.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const canDelete = gameState.currentUser?.role === 'Master' || task.creatorId === gameState.currentUser?.id;
    if (!canDelete) {
      showToast('Você não pode excluir esta tarefa.', 'error');
      return;
    }

    setGameState((prev) => ({
      ...prev,
      buildings: prev.buildings.map((b) =>
        b.id === buildingId ? { ...b, tasks: b.tasks.filter((t) => t.id !== taskId) } : b
      )
    }));

    if (editingTask?.task.id === taskId) {
      setEditingTask(null);
      setIsCreatingTask(false);
    }

    void deleteTaskRemote(taskId).catch(() => {
      showToast('Erro ao excluir tarefa.', 'error');
    });
  };

  return {
    handleOpenCreateTask,
    handleSaveNewTask,
    handleTaskFieldUpdate,
    updateTask,
    moveTask,
    handleDragStart,
    handleDragOver,
    handleDrop,
    confirmGrading,
    handleRenewal,
    deleteTask
  };
};
