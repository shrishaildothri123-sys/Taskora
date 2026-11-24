export type TaskStatus = 'backlog' | 'in_progress' | 'in_review' | 'done';

export type TaskPriority = 'high' | 'medium' | 'low';

export type ViewId = 'today' | 'inbox' | 'all' | 'board' | 'upcoming' | string;

export type DisplayMode = 'list' | 'board';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarBg: string;
  avatarText: string;
}

export interface Task {
  id: string;
  key: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId: string;
  dueDate: string; // YYYY-MM-DD or ''
  isToday: boolean;
  isInbox: boolean;
  subtasks: Subtask[];
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
}
