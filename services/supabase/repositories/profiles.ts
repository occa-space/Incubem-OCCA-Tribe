import { User } from '../../../types';
import { supabase } from '../client';
import { toProfileRow, toProfileRowPartial } from '../mappers';
import { throwIfError } from '../utils';

export const upsertProfile = async (user: User) => {
  const { error } = await supabase.from('profiles').upsert(toProfileRow(user));
  throwIfError(error);
};

export const updateProfile = async (userId: string, updates: Partial<User>) => {
  const payload = toProfileRowPartial(updates);
  const { error } = await supabase.from('profiles').update(payload).eq('id', userId);
  throwIfError(error);
};
