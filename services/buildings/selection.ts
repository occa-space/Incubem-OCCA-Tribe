import { BuildingData, BuildingType, GameState, Squad } from '../../types';

export const getSelectedBuildingMeta = ({
  gameState,
  selectedBuilding
}: {
  gameState: GameState;
  selectedBuilding?: BuildingData;
}) => {
  const isOwner = selectedBuilding?.ownerId === gameState.currentUser?.id;
  const isMyHouse = selectedBuilding?.type === BuildingType.RESIDENTIAL && isOwner;
  const isSquadHQ = selectedBuilding?.type === BuildingType.SQUAD_HQ;
  const isTribalCenter = selectedBuilding?.type === BuildingType.TRIBAL_CENTER;
  const buildingSquad: Squad | null = selectedBuilding
    ? gameState.squads.find((s) => s.id === selectedBuilding.squadId) || null
    : null;

  return { isOwner, isMyHouse, isSquadHQ, isTribalCenter, buildingSquad };
};
