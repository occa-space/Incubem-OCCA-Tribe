import { BuildingData, BuildingType, GameState, KanbanTask } from '../../types';

export type DisplayTask = KanbanTask & { originalBuildingId?: string };

export const getDisplayTasks = ({
  gameState,
  selectedBuilding,
  isMyHouse,
  isSquadHQ
}: {
  gameState: GameState;
  selectedBuilding?: BuildingData;
  isMyHouse: boolean;
  isSquadHQ: boolean;
}): DisplayTask[] => {
  let displayTasks: DisplayTask[] = selectedBuilding?.tasks || [];

  if (!selectedBuilding) return displayTasks;

  if (isMyHouse) {
    const allMyTasks: DisplayTask[] = [];
    const currentUserId = gameState.currentUser?.id;
    if (!currentUserId) return displayTasks;
    gameState.buildings.forEach((b) => {
      if (b.type !== BuildingType.RESIDENTIAL) {
        b.tasks.forEach((t) => {
          const participantIds = t.participants && t.participants.length > 0 ? t.participants : [t.creatorId];
          const isParticipant = participantIds.includes(currentUserId);
          const isAssignee = t.assigneeId === currentUserId;
          const isCreator = t.creatorId === currentUserId;
          if (isParticipant || isAssignee || isCreator) {
            allMyTasks.push({ ...t, originalBuildingId: b.id });
          }
        });
      }
    });
    displayTasks = allMyTasks;
  } else if (isSquadHQ && selectedBuilding.squadId) {
    const allSquadTasks: DisplayTask[] = [];
    const targetSquad = selectedBuilding.squadId;
    gameState.buildings.forEach((b) => {
      b.tasks.forEach((t) => {
        if (t.squadId === targetSquad) {
          allSquadTasks.push({ ...t, originalBuildingId: b.id });
        }
      });
    });
    displayTasks = allSquadTasks;
  }

  return displayTasks;
};
