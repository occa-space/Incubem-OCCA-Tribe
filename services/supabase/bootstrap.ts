import { INITIAL_BUILDINGS, REAL_SQUADS } from '../../data/seed';
import { BuildingData } from '../../types';
import { supabase } from './client';
import { toBuildingRow, toSquadRow } from './mappers';
import { throwIfError } from './utils';

export const ensureInitialData = async (currentUserId: string, isMaster: boolean) => {
  if (!isMaster) return false;
  let changed = false;

  const squadsResult = await supabase.from('squads').select('id');
  throwIfError(squadsResult.error);
  const squadsEmpty = (squadsResult.data || []).length === 0;

  if (squadsEmpty) {
    const { error } = await supabase.from('squads').insert(REAL_SQUADS.map(toSquadRow));
    throwIfError(error);
    changed = true;
  }

  const buildingsResult = await supabase.from('buildings').select('id');
  throwIfError(buildingsResult.error);
  const buildingsEmpty = (buildingsResult.data || []).length === 0;

  if (buildingsEmpty) {
    const seededBuildings: BuildingData[] = INITIAL_BUILDINGS.map((b) => ({
      ...b,
      ownerId: currentUserId
    }));
    const { error } = await supabase.from('buildings').insert(seededBuildings.map(toBuildingRow));
    throwIfError(error);
    changed = true;
  }

  return changed;
};
