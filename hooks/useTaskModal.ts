import { useState } from 'react';
import { KanbanTask } from '../types';

export const useTaskModal = () => {
  const [editingTask, setEditingTask] = useState<{ buildingId: string; task: KanbanTask } | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskModalTab, setTaskModalTab] = useState<1 | 2 | 3 | 4 | 5>(1);

  return {
    editingTask,
    setEditingTask,
    isCreatingTask,
    setIsCreatingTask,
    taskModalTab,
    setTaskModalTab
  };
};
