import { KanbanTask } from '../../../types';
import { supabase } from '../client';
import { toTaskRow, toTaskRowPartial } from '../mappers';
import { throwIfError } from '../utils';

export const createTask = async (buildingId: string, task: KanbanTask) => {
  const { error } = await supabase.from('tasks').insert(toTaskRow({ ...task, buildingId }));
  throwIfError(error);
};

export const updateTask = async (taskId: string, updates: Partial<KanbanTask>) => {
  const payload = toTaskRowPartial(updates);
  const { error } = await supabase.from('tasks').update(payload).eq('id', taskId);
  throwIfError(error);
};

export const deleteTask = async (taskId: string) => {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  throwIfError(error);
};
