import { KanbanTask } from '../types';

// Helper to calculate PA of a single task
export const calculateTaskPA = (task: Partial<KanbanTask>): number => {
  if (task.status === 'DONE' && task.finalPA) return task.finalPA;
  return Math.floor((task.size || 0) * (task.complexity || 1) * (task.ruleMultiplier || 1));
};
