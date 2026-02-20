import { BUILDING_PA_LIMITS } from '../../constants';
import { BuildingData, KanbanTask } from '../../types';
import { calculateTaskPA } from '../tasks/taskUtils';

export const getTaskStats = ({
  statsTasks,
  selectedBuilding
}: {
  statsTasks: KanbanTask[];
  selectedBuilding?: BuildingData;
}) => {
  const plannedPA = statsTasks
    .filter((t) => t.status !== 'DONE')
    .reduce((acc, t) => acc + calculateTaskPA(t), 0);

  const concludedPA = statsTasks.reduce((acc, t) => {
    const currentDone = t.status === 'DONE' ? t.finalPA || 0 : 0;
    const historySum = (t.history || []).reduce((hAcc, hEntry) => hAcc + hEntry.coins, 0);
    return acc + currentDone + historySum;
  }, 0);

  const paLimit = selectedBuilding ? BUILDING_PA_LIMITS[selectedBuilding.level] || 99999 : 0;
  const concludedPercent = Math.min(100, (concludedPA / paLimit) * 100);

  return { plannedPA, concludedPA, paLimit, concludedPercent };
};
