import { DailyEntry } from '../../../types';
import { supabase } from '../client';
import { toDailyRow } from '../mappers';
import { throwIfError } from '../utils';

export const upsertDaily = async (entry: DailyEntry) => {
  const { error } = await supabase.from('daily_entries').upsert(toDailyRow(entry));
  throwIfError(error);
};
