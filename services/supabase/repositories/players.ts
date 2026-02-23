import { PlayerProfile } from '../../../types';
import { supabase } from '../client';
import { toPlayerRow } from '../mappers';
import { throwIfError } from '../utils';

export const upsertPlayer = async (userId: string, player: PlayerProfile) => {
  const { error } = await supabase.from('players').upsert(toPlayerRow(userId, player));
  throwIfError(error);
};
