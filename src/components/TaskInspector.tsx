import React, { useEffect, useState } from 'react';
import {
  Copy,
  Plus,
  Send,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import { TODAY_ISO, TOMORROW_ISO } from '../data/initialData';
import { Member, Project, Task, TaskPriority, TaskStatus } from '../types';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../utils/taskHelpers';
import { MemberAvatar, PriorityChip, TaskCheckbox } from './TaskPrimitives';

interface TaskInspectorProps {
  task: Task | null;
  projects: Project[];
  members: Member[];
  currentUser: Member;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, patch: Partial<Task>) => void;
  onToggleComplete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onAddComment: (taskId: string, body: string) => void;
  onDuplicateTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskInspector: React.FC<TaskInspectorProps> = ({
  task,
  projects,
  members,
  currentUser,
  isOpen,
  onClose,
  onUpdateTask,
  onToggleComplete,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onAddComment,
  onDuplicateTask,
  onDeleteTask,
}) => {
  const [newSubtask, setNewSubtask] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setConfirmDelete(false);
    setNewSubtask('');
    setCommentBody('');
  }, [task?.id]);

  if (!isOpen || !task) return null;

  const isDone = task.status === 'done';
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSubtask.trim();
    if (!trimmed) return;
    onAddSubtask(task.id, trimmed);
    setNewSubtask('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentBody.trim();
    if (!trimmed) return;
    onAddComment(task.id, trimmed);
    setCommentBody('');
  };

  const inspectorContent = (
    <div className="flex h-full flex-col bg-white border-l border-[#E5DEFF]/70">
      {/* Top Action Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#E5DEFF]/60 px-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12px] font-medium text-[#7B7486] tabular-nums">
            {task.key}
          </span>
          <PriorityChip priority={task.priority} compact />
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onUpdateTask(task.id, { isToday: !task.isToday })}
            title={task.isToday ? 'Remove from Today' : 'Pin to Today'}
            aria-label={task.isToday ? 'Remove from Today' : 'Pin to Today'}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              task.isToday
                ? 'bg-[#EAE5F8] text-[#5300B7]'
                : 'text-[#6B7280] hover:bg-[#F4F2FB] hover:text-[#151C27]'
            }`}
          >
            <Sun className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onDuplicateTask(task.id)}
            title="Duplicate task"
            aria-label="Duplicate task"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F4F2FB] hover:text-[#151C27] transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-1 rounded-lg bg-[#FFE4E6] px-2 py-1">
              <button
                type="button"
                onClick={() => {
                  onDeleteTask(task.id);
                  setConfirmDelete(false);
                }}
                className="text-[11px] font-semibold text-[#BE123C] hover:underline"
              >
                Delete
              </button>
              <span className="text-[#FCA5A5]">·</span>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-[11px] font-medium text-[#4A4455]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              title="Delete task"
              aria-label="Delete task"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#FFE4E6] hover:text-[#BE123C] transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            title="Close inspector"
            aria-label="Close inspector"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#EAE5F8] hover:text-[#5300B7] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Inspector Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {/* Title & Completion Toggle */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="pt-1">
              <TaskCheckbox
                checked={isDone}
                onChange={() => onToggleComplete(task.id)}
                ariaLabel={`Mark "${task.title}" as ${isDone ? 'active' : 'completed'}`}
              />
            </div>
            <textarea
              rows={2}
              value={task.title}
              onChange={(e) => onUpdateTask(task.id, { title: e.target.value })}
              aria-label="Task title"
              className={`w-full resize-none rounded-lg border border-transparent bg-transparent px-1.5 py-0.5 font-display text-[17px] font-semibold leading-6 tracking-[-0.015em] focus:border-[#7C3AED] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/15 ${
                isDone ? 'line-through text-[#7B7486]' : 'text-[#151C27]'
              }`}
            />
          </div>

          <textarea
            rows={3}
            value={task.description}
            onChange={(e) => onUpdateTask(task.id, { description: e.target.value })}
            placeholder="Add context, links, or acceptance criteria..."
            aria-label="Task description"
            className="taskora-input w-full resize-y rounded-xl p-3 text-[13.5px] leading-relaxed text-[#4A4455] placeholder:text-[#9CA3AF]"
          />
        </div>

        {/* Structured Properties Grid */}
        <div className="grid grid-cols-[92px_1fr] items-center gap-y-3 gap-x-3 border-t border-[#E5DEFF]/60 pt-5 text-[13px]">
          <label htmlFor="inspector-status" className="text-[#6B7280] font-medium">
            Status
          </label>
          <select
            id="inspector-status"
            value={task.status}
            onChange={(e) => onUpdateTask(task.id, { status: e.target.value as TaskStatus })}
            className="taskora-input h-8 rounded-lg px-2.5 text-[13px] font-medium text-[#151C27]"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <label htmlFor="inspector-priority" className="text-[#6B7280] font-medium">
            Priority
          </label>
          <select
            id="inspector-priority"
            value={task.priority}
            onChange={(e) => onUpdateTask(task.id, { priority: e.target.value as TaskPriority })}
            className="taskora-input h-8 rounded-lg px-2.5 text-[13px] font-medium text-[#151C27]"
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <label htmlFor="inspector-project" className="text-[#6B7280] font-medium">
            Project
          </label>
          <select
            id="inspector-project"
            value={task.projectId}
            onChange={(e) => onUpdateTask(task.id, { projectId: e.target.value })}
            className="taskora-input h-8 rounded-lg px-2.5 text-[13px] font-medium text-[#151C27]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <label htmlFor="inspector-assignee" className="text-[#6B7280] font-medium">
            Assignee
          </label>
          <select
            id="inspector-assignee"
            value={task.assigneeId}
            onChange={(e) => onUpdateTask(task.id, { assigneeId: e.target.value })}
            className="taskora-input h-8 rounded-lg px-2.5 text-[13px] font-medium text-[#151C27]"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <label htmlFor="inspector-due" className="text-[#6B7280] font-medium">
            Due Date
          </label>
          <div className="space-y-1.5">
            <input
              id="inspector-due"
              type="date"
              value={task.dueDate}
              onChange={(e) => onUpdateTask(task.id, { dueDate: e.target.value })}
              className="taskora-input h-8 w-full rounded-lg px-2.5 text-[13px] font-medium text-[#151C27] tabular-nums"
            />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onUpdateTask(task.id, { dueDate: TODAY_ISO, isToday: true })}
                className="rounded-md bg-[#F4F2FB] px-2 py-0.5 text-[11px] font-medium text-[#5300B7] hover:bg-[#EAE5F8] transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => onUpdateTask(task.id, { dueDate: TOMORROW_ISO })}
                className="rounded-md bg-[#F4F2FB] px-2 py-0.5 text-[11px] font-medium text-[#4A4455] hover:bg-[#EAE5F8] transition-colors"
              >
                Tomorrow
              </button>
              {task.dueDate && (
                <button
                  type="button"
                  onClick={() => onUpdateTask(task.id, { dueDate: '' })}
                  className="rounded-md px-2 py-0.5 text-[11px] font-medium text-[#6B7280] hover:bg-[#F4F2FB] transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Subtasks Checklist */}
        <div className="border-t border-[#E5DEFF]/60 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[13px] font-semibold text-[#151C27]">
              Subtasks
            </h3>
            <span className="tabular-nums text-[12px] font-medium text-[#7B7486]">
              {completedSubtasks}/{task.subtasks.length}
            </span>
          </div>

          <div className="space-y-1.5">
            {task.subtasks.map((sub) => (
              <div
                key={sub.id}
                className="group flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-[#F9F9FF] transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <TaskCheckbox
                    checked={sub.completed}
                    onChange={() => onToggleSubtask(task.id, sub.id)}
                    ariaLabel={`Toggle subtask "${sub.title}"`}
                  />
                  <span
                    className={`text-[13px] leading-5 truncate ${
                      sub.completed ? 'line-through text-[#7B7486]' : 'text-[#151C27]'
                    }`}
                  >
                    {sub.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteSubtask(task.id, sub.id)}
                  aria-label={`Remove subtask "${sub.title}"`}
                  className="opacity-0 group-hover:opacity-100 rounded p-1 text-[#7B7486] hover:bg-[#FFE4E6] hover:text-[#BE123C] transition-all"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="Add subtask..."
              aria-label="Add subtask"
              className="taskora-input h-8 flex-1 rounded-lg px-2.5 text-[12.5px] text-[#151C27] placeholder:text-[#9CA3AF]"
            />
            <button
              type="submit"
              disabled={!newSubtask.trim()}
              aria-label="Add subtask"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#DDD6FE] bg-white text-[#4C1D95] hover:bg-[#F5F3FF] disabled:opacity-40 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* Activity & Comments */}
        <div className="border-t border-[#E5DEFF]/60 pt-5 space-y-3">
          <h3 className="font-display text-[13px] font-semibold text-[#151C27]">
            Activity
            {task.comments.length > 0 && (
              <span className="ml-1.5 font-sans text-[12px] font-medium text-[#7B7486] tabular-nums">
                {task.comments.length}
              </span>
            )}
          </h3>

          {task.comments.length > 0 && (
            <div className="space-y-3">
              {task.comments.map((comment) => {
                const author = members.find((m) => m.id === comment.authorId) ?? currentUser;
                return (
                  <div
                    key={comment.id}
                    className="rounded-xl border border-[#E5DEFF]/60 bg-[#F9F9FF] p-3 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <MemberAvatar member={author} size="sm" />
                        <span className="text-[12.5px] font-medium text-[#151C27]">
                          {author.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#7B7486]">{comment.createdAt}</span>
                    </div>
                    <p className="text-[13px] leading-relaxed text-[#4A4455]">{comment.body}</p>
                  </div>
                );
              })}
            </div>
          )}

          <form onSubmit={handleAddComment} className="flex items-center gap-2">
            <input
              type="text"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Write a comment..."
              aria-label="Write a comment"
              className="taskora-input h-9 flex-1 rounded-lg px-3 text-[13px] text-[#151C27] placeholder:text-[#9CA3AF]"
            />
            <button
              type="submit"
              disabled={!commentBody.trim()}
              aria-label="Post comment"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#6D28D9] text-white hover:bg-[#5B21B6] disabled:opacity-40 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Docked 3rd Pane (>=1280px) */}
      <aside className="hidden xl:block w-[360px] shrink-0 h-full">
        {inspectorContent}
      </aside>

      {/* Tablet & Mobile Overlay Drawer (<1280px) */}
      <div className="fixed inset-0 z-40 flex justify-end xl:hidden">
        <div
          className="fixed inset-0 bg-[#F4F2FB]/70 backdrop-blur-md transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        <aside className="relative z-10 h-full w-full max-w-[380px] elevation-3">
          {inspectorContent}
        </aside>
      </div>
    </>
  );
};
