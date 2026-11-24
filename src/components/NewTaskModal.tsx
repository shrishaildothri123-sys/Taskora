import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { TODAY_ISO } from '../data/initialData';
import { Member, Project, TaskPriority, TaskStatus } from '../types';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../utils/taskHelpers';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  members: Member[];
  defaultProjectId?: string;
  defaultIsToday?: boolean;
  defaultIsInbox?: boolean;
  onCreateTask: (payload: {
    title: string;
    description: string;
    projectId: string;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeId: string;
    dueDate: string;
    isToday: boolean;
    isInbox: boolean;
  }) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  projects,
  members,
  defaultProjectId,
  defaultIsToday = false,
  defaultIsInbox = false,
  onCreateTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId ?? projects[0]?.id ?? 'proj-launch');
  const [status, setStatus] = useState<TaskStatus>('backlog');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState(members[0]?.id ?? 'm-maya');
  const [dueDate, setDueDate] = useState(defaultIsToday ? TODAY_ISO : '');
  const [isToday, setIsToday] = useState(defaultIsToday);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setProjectId(defaultProjectId ?? projects[0]?.id ?? 'proj-launch');
      setStatus('backlog');
      setPriority('medium');
      setAssigneeId(members[0]?.id ?? 'm-maya');
      setDueDate(defaultIsToday ? TODAY_ISO : '');
      setIsToday(defaultIsToday);
    }
  }, [isOpen, defaultProjectId, defaultIsToday, projects, members]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onCreateTask({
      title: trimmed,
      description: description.trim(),
      projectId,
      status,
      priority,
      assigneeId,
      dueDate,
      isToday,
      isInbox: defaultIsInbox,
    });
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Create new task"
    >
      <div
        className="fixed inset-0 bg-[#F4F2FB]/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-[#DDD6FE] bg-white elevation-3"
      >
        <div className="flex items-center justify-between border-b border-[#E5DEFF]/70 px-5 py-4">
          <h2 className="font-display text-[16px] font-semibold text-[#151C27]">
            New Task
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#EAE5F8] hover:text-[#5300B7] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="new-task-title" className="text-[12.5px] font-medium text-[#4A4455]">
              Task Title
            </label>
            <input
              id="new-task-title"
              type="text"
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be accomplished?"
              className="taskora-input h-10 w-full rounded-lg px-3 text-[14px] text-[#151C27] placeholder:text-[#9CA3AF]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="new-task-desc" className="text-[12.5px] font-medium text-[#4A4455]">
              Description
            </label>
            <textarea
              id="new-task-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes, context, or links..."
              className="taskora-input w-full rounded-lg p-3 text-[13.5px] text-[#4A4455] placeholder:text-[#9CA3AF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="new-task-project" className="text-[12px] font-medium text-[#6B7280]">
                Project
              </label>
              <select
                id="new-task-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="taskora-input h-9 w-full rounded-lg px-2.5 text-[13px] text-[#151C27]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="new-task-priority" className="text-[12px] font-medium text-[#6B7280]">
                Priority
              </label>
              <select
                id="new-task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="taskora-input h-9 w-full rounded-lg px-2.5 text-[13px] text-[#151C27]"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="new-task-status" className="text-[12px] font-medium text-[#6B7280]">
                Status
              </label>
              <select
                id="new-task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="taskora-input h-9 w-full rounded-lg px-2.5 text-[13px] text-[#151C27]"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="new-task-assignee" className="text-[12px] font-medium text-[#6B7280]">
                Assignee
              </label>
              <select
                id="new-task-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="taskora-input h-9 w-full rounded-lg px-2.5 text-[13px] text-[#151C27]"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <label htmlFor="new-task-due" className="text-[12.5px] font-medium text-[#6B7280]">
                Due Date
              </label>
              <input
                id="new-task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="taskora-input h-8 rounded-lg px-2.5 text-[12.5px] text-[#151C27] tabular-nums"
              />
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer text-[13px] font-medium text-[#4A4455]">
              <input
                type="checkbox"
                checked={isToday}
                onChange={(e) => setIsToday(e.target.checked)}
                className="h-4 w-4 rounded border-[#C4B5FD] text-[#6D28D9] focus:ring-[#7C3AED]"
              />
              <span>Pin to Today</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#E5DEFF]/70 bg-[#F9F9FF] px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-[#DDD6FE] bg-white px-4 text-[13px] font-medium text-[#4C1D95] hover:bg-[#F5F3FF] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="h-9 rounded-lg bg-[#6D28D9] px-4 text-[13px] font-medium text-white hover:bg-[#5B21B6] disabled:opacity-45 transition-colors"
          >
            Create Task
          </button>
        </div>
      </form>
    </div>
  );
};
