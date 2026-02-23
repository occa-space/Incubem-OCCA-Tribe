import { Resources } from '../../../types';
import { supabase } from '../client';
import { toResourcesRow } from '../mappers';
import { throwIfError } from '../utils';

export const upsertResources = async (userId: string, resources: Resources) => {
  const { error } = await supabase.from('resources').upsert(toResourcesRow(userId, resources));
  throwIfError(error);
};
