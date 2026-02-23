import { FeedbackEntry } from '../../../types';
import { supabase } from '../client';
import { toFeedbackRow } from '../mappers';
import { throwIfError } from '../utils';

export const upsertFeedback = async (entry: FeedbackEntry) => {
  const { error } = await supabase.from('feedback_entries').upsert(toFeedbackRow(entry));
  throwIfError(error);
};
