import { TODAY_ISO, TOMORROW_ISO } from '../data/initialData';
import { Task, TaskPriority, TaskStatus } from '../types';

export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'done', label: 'Done' },
];

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string; weight: number }[] = [
  { value: 'high', label: 'High', weight: 3 },
  { value: 'medium', label: 'Medium', weight: 2 },
  { value: 'low', label: 'Low', weight: 1 },
];

export function getStatusLabel(status: TaskStatus): string {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? 'Backlog';
}

export function getPriorityWeight(priority: TaskPriority): number {
  return PRIORITY_OPTIONS.find((p) => p.value === priority)?.weight ?? 1;
}

export function formatDueDate(dateStr: string): { text: string; isOverdue: boolean; isToday: boolean } {
  if (!dateStr) {
    return { text: 'No due date', isOverdue: false, isToday: false };
  }
  if (dateStr === TODAY_ISO) {
    return { text: 'Today', isOverdue: false, isToday: true };
  }
  if (dateStr === TOMORROW_ISO) {
    return { text: 'Tomorrow', isOverdue: false, isToday: false };
  }
  const isOverdue = dateStr < TODAY_ISO;
  const parsed = new Date(`${dateStr}T00:00:00`);
  const formatted = parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return { text: formatted, isOverdue, isToday: false };
}

export function sortTasks(tasks: Task[], sortBy: 'priority' | 'dueDate' | 'title'): Task[] {
  return [...tasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const diff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
      if (diff !== 0) return diff;
    }
    if (sortBy === 'dueDate') {
      const da = a.dueDate || '9999-12-31';
      const db = b.dueDate || '9999-12-31';
      if (da !== db) return da.localeCompare(db);
    }
    return a.title.localeCompare(b.title);
  });
}
