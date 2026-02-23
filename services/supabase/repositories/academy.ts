import { LearningTrack } from '../../../types';
import { supabase } from '../client';
import { toLearningTrackRow } from '../mappers';
import { throwIfError } from '../utils';

export const upsertLearningTrack = async (track: LearningTrack) => {
  const { error } = await supabase.from('learning_tracks').upsert(toLearningTrackRow(track));
  throwIfError(error);
};
