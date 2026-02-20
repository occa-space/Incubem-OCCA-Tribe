import { Users, Briefcase, RefreshCcw } from 'lucide-react';
import { KanbanStatus } from '../../types';

export const KANBAN_COLUMNS: { id: KanbanStatus; label: string; color: string }[] = [
  { id: 'BACKLOG', label: 'Backlog', color: 'bg-slate-700' },
  { id: 'TODO', label: 'A Fazer', color: 'bg-blue-900/50' },
  { id: 'DOING', label: 'Fazendo', color: 'bg-yellow-900/50' },
  { id: 'BLOCKED', label: 'Bloqueado', color: 'bg-red-900/50' },
  { id: 'REVIEW', label: 'Para Revisão', color: 'bg-purple-900/50' },
  { id: 'DONE', label: 'Concluído', color: 'bg-green-900/50' },
];

export const SWIMLANES: { id: string; label: string; rule: string; color: string; icon: any }[] = [
  { id: 'lane_integrated', label: 'Integradas (I)', rule: 'INTEGRATED', color: 'text-blue-400', icon: Users },
  { id: 'lane_negotiated', label: 'Negociadas (N)', rule: 'NEGOTIATED', color: 'text-purple-400', icon: Briefcase },
  { id: 'lane_fixed', label: 'Fixas (F)', rule: 'FIXED', color: 'text-orange-400', icon: RefreshCcw },
];

export const SQUAD_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#84cc16', // Lime
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#d946ef', // Fuchsia
  '#f43f5e', // Rose
];

export const SPRINT_DURATION_DAYS = 14;
