import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './client';

interface RealtimeOptions {
  squadId?: string;
  isMaster?: boolean;
  onChange: () => void;
}

export const subscribeToGameData = ({ squadId, isMaster, onChange }: RealtimeOptions): RealtimeChannel => {
  const channel = supabase.channel('game-sync');

  const maybeFilter = (table: string) => {
    if (isMaster || !squadId) return { event: '*', schema: 'public', table };
    return { event: '*', schema: 'public', table, filter: `squad_id=eq.${squadId}` };
  };

  channel
    .on('postgres_changes', maybeFilter('buildings'), onChange)
    .on('postgres_changes', maybeFilter('tasks'), onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'squads' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'app_state' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_entries' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback_entries' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'learning_tracks' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'market_items' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'purchase_records' }, onChange)
    .subscribe();

  return channel;
};
