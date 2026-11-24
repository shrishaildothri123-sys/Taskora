import React, { useState } from 'react';
import { Calendar, CheckCircle2, MessageSquare, Plus } from 'lucide-react';
import { Member, Project, Task, TaskPriority, TaskStatus } from '../types';
import { STATUS_OPTIONS, formatDueDate } from '../utils/taskHelpers';
import { MemberAvatar, PriorityChip, TaskCheckbox } from './TaskPrimitives';

interface BoardViewProps {
  title: string;
  subtitle?: string;
  activeProject?: Project;
  tasks: Task[];
  projects: Project[];
  members: Member[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onMoveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onQuickAddTask: (payload: {
    title: string;
    projectId: string;
    status: TaskStatus;
    priority: TaskPriority;
  }) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  title,
  subtitle,
  activeProject,
  tasks,
  projects,
  members,
  selectedTaskId,
  onSelectTask,
  onToggleComplete,
  onMoveTaskStatus,
  onQuickAddTask,
}) => {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [addingColumn, setAddingColumn] = useState<TaskStatus | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');

  const handleColumnAdd = (e: React.FormEvent, status: TaskStatus) => {
    e.preventDefault();
    const trimmed = newCardTitle.trim();
    if (!trimmed) return;
    onQuickAddTask({
      title: trimmed,
      projectId: activeProject?.id ?? projects[0]?.id ?? 'proj-launch',
      status,
      priority: 'medium',
    });
    setNewCardTitle('');
    setAddingColumn(null);
  };

  return (
    <div className="flex h-full flex-col px-4 py-6 sm:px-6 lg:px-8 space-y-5">
      {/* Board Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            {activeProject && (
              <span
                className="h-3 w-3 rounded-[4px]"
                style={{ backgroundColor: activeProject.color }}
                aria-hidden="true"
              />
            )}
            <h2 className="font-display text-[24px] font-semibold tracking-[-0.02em] text-[#151C27]">
              {title}
            </h2>
            <span className="tabular-nums text-[13px] font-medium text-[#7B7486]">
              {tasks.length} cards
            </span>
          </div>
          {subtitle && <p className="text-[13.5px] text-[#4A4455]">{subtitle}</p>}
        </div>
      </div>

      {/* 4-Column Kanban Canvas */}
      <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 items-start pb-6">
        {STATUS_OPTIONS.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.value);
          const isDropTarget = dragOverColumn === column.value;

          return (
            <div
              key={column.value}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverColumn !== column.value) {
                  setDragOverColumn(column.value);
                }
              }}
              onDragLeave={() => {
                if (dragOverColumn === column.value) {
                  setDragOverColumn(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                const droppedId = e.dataTransfer.getData('text/plain') || draggingTaskId;
                if (droppedId) {
                  onMoveTaskStatus(droppedId, column.value);
                }
                setDraggingTaskId(null);
                setDragOverColumn(null);
              }}
              className={`flex flex-col rounded-2xl border p-3 transition-colors duration-150 min-h-[260px] ${
                isDropTarget
                  ? 'border-[#7C3AED] bg-[#EAE5F8]/70'
                  : 'border-[#E5DEFF]/70 bg-[#EAE5F8]/40'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1.5 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-[13.5px] font-semibold text-[#151C27]">
                    {column.label}
                  </h3>
                  <span className="tabular-nums text-[12px] font-medium text-[#6B7280]">
                    {columnTasks.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAddingColumn(column.value);
                    setNewCardTitle('');
                  }}
                  aria-label={`Add task to ${column.label}`}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-[#6B7280] hover:bg-white hover:text-[#5300B7] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Cards Stack */}
              <div className="space-y-2.5">
                {columnTasks.map((task) => {
                  const project = projects.find((p) => p.id === task.projectId);
                  const assignee = members.find((m) => m.id === task.assigneeId);
                  const due = formatDueDate(task.dueDate);
                  const isDone = task.status === 'done';
                  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
                  const totalSubtasks = task.subtasks.length;
                  const isSelected = selectedTaskId === task.id;
                  const isDragging = draggingTaskId === task.id;

                  return (
                    <article
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggingTaskId(task.id);
                        e.dataTransfer.setData('text/plain', task.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnd={() => {
                        setDraggingTaskId(null);
                        setDragOverColumn(null);
                      }}
                      onClick={() => onSelectTask(task.id)}
                      className={`group cursor-pointer rounded-xl border bg-white p-3.5 transition-all duration-150 ease-out ${
                        isDragging
                          ? 'rotate-[1.5deg] scale-[1.01] border-[#7C3AED] elevation-2 opacity-90'
                          : isSelected
                            ? 'border-[#7C3AED] bg-[#FAF8FF] elevation-2'
                            : 'border-[#EDE9FE] elevation-1 hover:-translate-y-[1px] hover:border-[#DDD6FE] hover:elevation-2'
                      }`}
                    >
                      {/* Lead directly with Checkbox + Title */}
                      <div className="flex items-start gap-2.5">
                        <div className="pt-0.5">
                          <TaskCheckbox
                            checked={isDone}
                            onChange={() => onToggleComplete(task.id)}
                            ariaLabel={`Mark "${task.title}" as ${isDone ? 'active' : 'completed'}`}
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <h4
                            className={`text-[13.5px] leading-5 font-medium ${
                              isDone
                                ? 'line-through text-[#7B7486]'
                                : 'text-[#151C27] group-hover:text-[#5300B7]'
                            }`}
                          >
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[11.5px] text-[#7B7486] tabular-nums">
                            <span className="font-mono">{task.key}</span>
                            {project && !activeProject && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="inline-flex items-center gap-1 truncate">
                                  <span
                                    className="h-1.5 w-1.5 rounded-[2px] shrink-0"
                                    style={{ backgroundColor: project.color }}
                                  />
                                  <span className="truncate">{project.name}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Optional Subtask Progress Bar */}
                      {totalSubtasks > 0 && (
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-[#6B7280] tabular-nums">
                            <span className="inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-[#7B7486]" />
                              <span>
                                {completedSubtasks}/{totalSubtasks} subtasks
                              </span>
                            </span>
                          </div>
                          <div className="h-1 w-full overflow-hidden rounded-full bg-[#F0F3FF]">
                            <div
                              className="h-full rounded-full bg-[#7C3AED] transition-all duration-200"
                              style={{
                                width: `${Math.round((completedSubtasks / totalSubtasks) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Card Footer */}
                      <div className="mt-3 flex items-center justify-between gap-2 pt-2.5 border-t border-[#E5DEFF]/50">
                        <div className="flex items-center gap-2">
                          <PriorityChip priority={task.priority} compact />
                          {task.dueDate && (
                            <span
                              className={`inline-flex items-center gap-1 text-[11.5px] tabular-nums ${
                                due.isOverdue && !isDone
                                  ? 'text-[#BE123C] font-medium'
                                  : due.isToday && !isDone
                                    ? 'text-[#5300B7] font-medium'
                                    : 'text-[#6B7280]'
                              }`}
                            >
                              <Calendar className="h-3 w-3" />
                              <span>{due.text}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {task.comments.length > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[11px] text-[#7B7486] tabular-nums">
                              <MessageSquare className="h-3 w-3" />
                              {task.comments.length}
                            </span>
                          )}
                          <MemberAvatar member={assignee} size="sm" />
                        </div>
                      </div>
                    </article>
                  );
                })}

                {addingColumn === column.value ? (
                  <form
                    onSubmit={(e) => handleColumnAdd(e, column.value)}
                    className="rounded-xl border border-[#DDD6FE] bg-white p-3 space-y-2.5 elevation-1"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      placeholder="Card title..."
                      className="taskora-input w-full rounded-lg px-2.5 py-1.5 text-[13px] text-[#151C27] placeholder:text-[#9CA3AF]"
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAddingColumn(null)}
                        className="rounded-md px-2.5 py-1 text-[12px] font-medium text-[#6B7280] hover:bg-[#EAE5F8]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!newCardTitle.trim()}
                        className="rounded-md bg-[#6D28D9] px-3 py-1 text-[12px] font-medium text-white hover:bg-[#5B21B6] disabled:opacity-45"
                      >
                        Add Card
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAddingColumn(column.value);
                      setNewCardTitle('');
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#CCC3D7]/80 py-2 text-[12.5px] font-medium text-[#6B7280] hover:border-[#7C3AED] hover:bg-white/70 hover:text-[#5300B7] transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add card</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
