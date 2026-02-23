import { BuildingData } from '../../../types';
import { supabase } from '../client';
import { toBuildingRow, toBuildingRowPartial } from '../mappers';
import { throwIfError } from '../utils';

export const createBuilding = async (building: BuildingData) => {
  const { error } = await supabase.from('buildings').insert(toBuildingRow(building));
  throwIfError(error);
};

export const updateBuilding = async (id: string, updates: Partial<BuildingData>) => {
  const payload = toBuildingRowPartial(updates);
  const { error } = await supabase.from('buildings').update(payload).eq('id', id);
  throwIfError(error);
};

export const deleteBuilding = async (id: string) => {
  const { error } = await supabase.from('buildings').delete().eq('id', id);
  throwIfError(error);
};
