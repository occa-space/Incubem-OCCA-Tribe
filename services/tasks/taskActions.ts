import { Dispatch, SetStateAction } from 'react';
import { AIM_OPTIONS, BUILDING_PA_LIMITS, calculateNextLevelXP } from '../../constants';
import { BuildingType, GameState, KanbanStatus, KanbanTask, TaskHistoryEntry } from '../../types';

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
      id: Math.random().toString(36).substr(2, 9),
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

    // Close
    setEditingTask(null);
    setIsCreatingTask(false);
    showToast('Tarefa criada com sucesso!', 'success');
  };

  // Wrapper for updating draft OR global state
  const handleTaskFieldUpdate = (updates: Partial<KanbanTask>, newBuildingId?: string) => {
    if (!editingTask) return;

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
    setGameState((prev) => ({
      ...prev,
      buildings: prev.buildings.map((b) =>
        b.id === buildingId ? { ...b, tasks: b.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)) } : b
      )
    }));
    // Sync local state if currently open (to avoid flickering)
    if (editingTask && editingTask.task.id === taskId && !isCreatingTask) {
      setEditingTask((prev) => (prev ? { ...prev, task: { ...prev.task, ...updates } } : null));
    }
  };

  const moveTask = (e: React.MouseEvent | null, task: KanbanTask, targetCol: KanbanStatus, buildingId: string) => {
    if (e) e.stopPropagation();
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

    if (ConclusionPAWithHistory + totalTaskPA > paLimit) {
      showToast(`Capacidade de armazenamento atingida! (${ConclusionPAWithHistory}/${paLimit} PA)`, 'error');
      return;
    }

    const aimValue = task.aim !== undefined ? task.aim : 1;
    const aimOption = AIM_OPTIONS.find((o) => o.value === aimValue);
    const aimMultiplier = aimOption?.multiplier || 0;

    const participants = task.participants && task.participants.length > 0 ? task.participants : [gameState.currentUser.id];
    const isParticipating = participants.includes(gameState.currentUser!.id);

    let myBasePA = 0;
    if (task.ruleValue === 'NEGOTIATED') {
      myBasePA = task.customPaDistribution?.[gameState.currentUser!.id] || 0;
    } else {
      myBasePA = totalTaskPA;
    }

    const myFinalPA = Math.floor(myBasePA * aimMultiplier);
    const myCoins = myFinalPA;
    const myXP = myFinalPA * 10;

    // Routine History Entry
    const historyEntry: TaskHistoryEntry = {
      timestamp: Date.now(),
      aim: aimValue,
      xp: myXP,
      coins: myCoins,
      participants: [...participants],
      feedback: task.feedback,
      sprint: gameState.sprintCycle
    };

    setGameState((prev) => {
      let playerUpdate = { ...prev.player };
      let resourcesUpdate = { ...prev.resources };

      if (isParticipating) {
        const newTotalPA = prev.player.totalPA + myFinalPA;
        let newXP = prev.player.currentXP + myXP;
        let newLevel = prev.player.level;
        let newNextLevelXP = prev.player.nextLevelXP;

        while (newXP >= newNextLevelXP) {
          newXP -= newNextLevelXP;
          newLevel++;
          newNextLevelXP = calculateNextLevelXP(newLevel);
        }
        const aimToStars = aimValue === 0 ? 1 : aimValue === 1 ? 3 : aimValue === 2 ? 4 : 5;
        const newRep = prev.player.reputation * 0.95 + aimToStars * 0.05;

        playerUpdate = {
          ...prev.player,
          level: newLevel,
          currentXP: newXP,
          nextLevelXP: newNextLevelXP,
          totalPA: newTotalPA,
          reputation: newRep
        };
        resourcesUpdate = {
          coins: prev.resources.coins + myCoins
        };
      }

      let isLimitTriggered = false;
      let limitType: 'QUANTITY' | 'TIME' = 'QUANTITY';

      return {
        ...prev,
        player: playerUpdate,
        resources: resourcesUpdate,
        buildings: prev.buildings.map((b) => {
          if (b.id === buildingId) {
            return {
              ...b,
              tasks: b.tasks.map((t) => {
                if (t.id === task.id) {
                  const isFixed = t.ruleValue === 'FIXED';

                  // Increment count if it's a fixed task
                  const newCount = isFixed ? (t.fixedQuantityCount || 0) + 1 : 0;

                  // Check Limits
                  let limitReached = false;
                  if (isFixed) {
                    // Check Quantity Limit
                    if (t.fixedQuantityLimit && newCount >= t.fixedQuantityLimit) {
                      limitReached = true;
                      limitType = 'QUANTITY';
                    }
                    // Check Deadline Limit
                    if (t.fixedDeadline && Date.now() >= t.fixedDeadline) {
                      limitReached = true;
                      limitType = 'TIME';
                    }
                  }

                  if (limitReached) {
                    isLimitTriggered = true;
                    setRenewalPrompt({ buildingId, taskId: t.id, type: limitType });
                  }

                  const nextStatus: KanbanStatus = isFixed && !limitReached ? 'BACKLOG' : 'DONE';

                  return {
                    ...t,
                    status: nextStatus,
                    aim: aimValue,
                    finalPA: myFinalPA,
                    finalXP: myXP,
                    finalCoins: myCoins,
                    fixedQuantityCount: newCount,
                    history: [...(t.history || []), historyEntry],
                    // Reset ephemeral fields if routine and not yet finished permanently
                    ...(isFixed && !limitReached
                      ? {
                          aim: undefined,
                          feedback: undefined,
                          evidenceLink: undefined,
                          deliveryNotes: undefined,
                          reflections: undefined,
                          finalPA: undefined,
                          finalXP: undefined,
                          finalCoins: undefined
                        }
                      : {})
                  };
                }
                return t;
              })
            };
          }
          return b;
        })
      };
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

    setRenewalPrompt(null);
    showToast(renew ? 'Tarefa renovada e movida para o Backlog!' : 'Tarefa finalizada permanentemente.', 'info');
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
    handleRenewal
  };
};
