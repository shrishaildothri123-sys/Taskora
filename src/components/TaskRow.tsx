import React from 'react';
import { Calendar, CheckCircle2, MessageSquare } from 'lucide-react';
import { Member, Project, Task } from '../types';
import { formatDueDate } from '../utils/taskHelpers';
import { MemberAvatar, PriorityChip, TaskCheckbox } from './TaskPrimitives';

interface TaskRowProps {
  task: Task;
  project?: Project;
  assignee?: Member;
  isSelected: boolean;
  onSelect: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  showProject?: boolean;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  project,
  assignee,
  isSelected,
  onSelect,
  onToggleComplete,
  showProject = true,
}) => {
  const isDone = task.status === 'done';
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const due = formatDueDate(task.dueDate);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(task.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(task.id);
        }
      }}
      className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-3 text-left transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7C3AED] ${
        isSelected
          ? 'bg-[#F5F3FF]'
          : 'bg-white hover:bg-[#F9F9FF]'
      }`}
    >
      {/* Left: Checkbox + Key + Title */}
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        <div className="pt-0.5 sm:pt-0">
          <TaskCheckbox
            checked={isDone}
            onChange={() => onToggleComplete(task.id)}
            ariaLabel={`Mark "${task.title}" as ${isDone ? 'active' : 'completed'}`}
          />
        </div>

        <span className="hidden md:inline-block font-mono text-[11px] font-medium text-[#7B7486] tabular-nums shrink-0">
          {task.key}
        </span>

        <span
          className={`text-[14px] leading-5 transition-colors duration-150 truncate ${
            isDone
              ? 'line-through text-[#7B7486] font-normal'
              : 'text-[#151C27] font-medium group-hover:text-[#5300B7]'
          }`}
        >
          {task.title}
        </span>
      </div>

      {/* Right: Unboxed Metadata + Priority + Avatar */}
      <div className="flex items-center justify-between sm:justify-end gap-3 pl-7 sm:pl-0 shrink-0">
        <div className="flex items-center gap-2 text-[12px] text-[#6B7280] tabular-nums">
          {showProject && project && (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span
                className="h-2 w-2 rounded-[2px]"
                style={{ backgroundColor: project.color }}
                aria-hidden="true"
              />
              <span className="max-w-[110px] truncate">{project.name}</span>
            </span>
          )}

          {totalSubtasks > 0 && (
            <>
              {showProject && project && (
                <span className="text-[#CCC3D7]" aria-hidden="true">
                  ·
                </span>
              )}
              <span
                className="inline-flex items-center gap-1 whitespace-nowrap"
                title={`${completedSubtasks} of ${totalSubtasks} subtasks done`}
              >
                <CheckCircle2 className="h-3 w-3 text-[#7B7486]" />
                <span>
                  {completedSubtasks}/{totalSubtasks}
                </span>
              </span>
            </>
          )}

          {task.comments.length > 0 && (
            <>
              <span className="text-[#CCC3D7]" aria-hidden="true">
                ·
              </span>
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <MessageSquare className="h-3 w-3 text-[#7B7486]" />
                <span>{task.comments.length}</span>
              </span>
            </>
          )}

          {task.dueDate && (
            <>
              <span className="text-[#CCC3D7]" aria-hidden="true">
                ·
              </span>
              <span
                className={`inline-flex items-center gap-1 whitespace-nowrap ${
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
            </>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <PriorityChip priority={task.priority} compact />
          <MemberAvatar member={assignee} size="sm" />
        </div>
      </div>
    </div>
  );
};
