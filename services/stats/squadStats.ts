import { KanbanTask } from '../../types';
import { calculateTaskPA } from '../tasks/taskUtils';

export const getSquadStats = ({
  displayTasks,
  dashboardTimeFilter,
  concludedPA
}: {
  displayTasks: KanbanTask[];
  dashboardTimeFilter: 'ALL' | number;
  concludedPA: number;
}) => {
  const squadStats = {
    plannedPA: 0,
    completedPA: 0,
    totalXP: 0,
    reputation: 0,
    level: 1,
    currentXPInLevel: 0,
    nextLevelThreshold: 1000,
    xpProgress: 0
  };

  // Filter tasks based on dashboardTimeFilter
  const filteredTasks = displayTasks.filter((t) => {
    if (dashboardTimeFilter === 'ALL' || t.sprintHistory?.includes(`Sprint ${dashboardTimeFilter}`)) {
      return true;
    }
    return false;
  });

  const plannedFiltered = filteredTasks.filter((t) => t.status !== 'DONE');

  squadStats.plannedPA = plannedFiltered.reduce((acc, t) => acc + calculateTaskPA(t), 0);
  squadStats.completedPA = concludedPA;

  // XP and Level (Calculated from ALL TIME mostly, but we can display filtered stats)
  squadStats.totalXP = displayTasks.reduce((acc, t) => {
    const currentXP = t.status === 'DONE' ? t.finalXP || 0 : 0;
    const historyXP = (t.history || []).reduce((hAcc, he) => hAcc + he.xp, 0);
    return acc + currentXP + historyXP;
  }, 0);

  // Squad Level Formula logic
  let level = 1;
  let xpAccumulator = 0;
  let nextLevelXP = 2000; // Base Squad XP req

  while (squadStats.totalXP >= xpAccumulator + nextLevelXP) {
    xpAccumulator += nextLevelXP;
    level++;
    nextLevelXP = Math.floor(2000 * Math.pow(1.5, level - 1));
  }

  squadStats.level = level;
  squadStats.currentXPInLevel = squadStats.totalXP - xpAccumulator;
  squadStats.nextLevelThreshold = nextLevelXP;
  squadStats.xpProgress = (squadStats.currentXPInLevel / squadStats.nextLevelThreshold) * 100;

  // Reputation (Avg AIM)
  const ratedTasksCount = displayTasks.reduce((acc, t) => {
    let count = t.status === 'DONE' && t.aim !== undefined ? 1 : 0;
    count += (t.history || []).length;
    return acc + count;
  }, 0);

  const ratedTasksSum = displayTasks.reduce((acc, t) => {
    let sum = t.status === 'DONE' && t.aim !== undefined ? t.aim || 0 : 0;
    sum += (t.history || []).reduce((hAcc, he) => hAcc + he.aim, 0);
    return acc + sum;
  }, 0);

  squadStats.reputation = ratedTasksCount > 0 ? ratedTasksSum / ratedTasksCount : 0;

  return squadStats;
};
