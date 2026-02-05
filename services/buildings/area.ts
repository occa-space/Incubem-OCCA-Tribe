import { BuildingData, GridPosition, GRID_SIZE } from '../../types';
import { getBuildingSize } from '../../constants';

export const isAreaOccupied = (
  buildings: BuildingData[],
  startPos: GridPosition,
  size: number,
  excludeBuildingId?: string
) => {
  if (startPos.x < 0 || startPos.z < 0 || startPos.x + size > GRID_SIZE || startPos.z + size > GRID_SIZE) return true;
  return buildings.some((b) => {
    if (b.id === excludeBuildingId) return false;
    const bSize = getBuildingSize(b.level, b.type);
    const xOverlap = startPos.x < b.position.x + bSize && startPos.x + size > b.position.x;
    const zOverlap = startPos.z < b.position.z + bSize && startPos.z + size > b.position.z;
    return xOverlap && zOverlap;
  });
};
