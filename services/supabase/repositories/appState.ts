import { supabase } from '../client';
import { throwIfError } from '../utils';

export const updateAppState = async (updates: { sprint_cycle?: number; sprint_start_date?: number }) => {
  const { error } = await supabase
    .from('app_state')
    .update(updates)
    .eq('id', 'global');
  throwIfError(error);
};
