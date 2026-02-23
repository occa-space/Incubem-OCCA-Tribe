import { Squad } from '../../../types';
import { supabase } from '../client';
import { toSquadRow, toSquadRowPartial } from '../mappers';
import { throwIfError } from '../utils';

export const createSquad = async (squad: Squad) => {
  const { error } = await supabase.from('squads').insert(toSquadRow(squad));
  throwIfError(error);
};

export const upsertSquads = async (squads: Squad[]) => {
  const { error } = await supabase.from('squads').upsert(squads.map(toSquadRow));
  throwIfError(error);
};

export const updateSquad = async (squadId: string, updates: Partial<Squad>) => {
  const payload = toSquadRowPartial(updates);
  const { error } = await supabase.from('squads').update(payload).eq('id', squadId);
  throwIfError(error);
};
