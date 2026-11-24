import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Sun } from 'lucide-react';
import { Member, Project, Task, TaskPriority } from '../types';
import { sortTasks } from '../utils/taskHelpers';
import { TaskRow } from './TaskRow';

interface TodayViewProps {
  tasks: Task[];
  projects: Project[];
  members: Member[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onQuickAddTask: (payload: {
    title: string;
    projectId: string;
    priority: TaskPriority;
    isToday: boolean;
  }) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  tasks,
  projects,
  members,
  selectedTaskId,
  onSelectTask,
  onToggleComplete,
  onQuickAddTask,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [quickProjectId, setQuickProjectId] = useState(projects[0]?.id ?? 'proj-personal');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('medium');
  const [showCompleted, setShowCompleted] = useState(true);

  const todayTasks = tasks.filter((t) => t.isToday);
  const activeToday = todayTasks.filter((t) => t.status !== 'done');
  const completedToday = todayTasks.filter((t) => t.status === 'done');

  const highFocus = sortTasks(
    activeToday.filter((t) => t.priority === 'high'),
    'title'
  );
  const scheduledToday = sortTasks(
    activeToday.filter((t) => t.priority !== 'high'),
    'priority'
  );

  const totalCount = todayTasks.length;
  const doneCount = completedToday.length;
  const completionPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickTitle.trim();
    if (!trimmed) return;
    onQuickAddTask({
      title: trimmed,
      projectId: quickProjectId,
      priority: quickPriority,
      isToday: true,
    });
    setQuickTitle('');
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Calm Editorial Today Header */}
      <section className="rounded-2xl border border-[#E5DEFF]/70 bg-white p-6 elevation-1">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#6D28D9]">
              <Sun className="h-4 w-4" />
              <span>Tuesday, November 24</span>
            </div>
            <h2 className="font-display text-[26px] sm:text-[30px] font-semibold tracking-[-0.025em] text-[#151C27] text-balance">
              Today’s Focus
            </h2>
            <p className="text-[14px] text-[#4A4455]">
              Calm, intentional progress across your priority deliverables.
            </p>
          </div>

          <div className="sm:text-right space-y-1.5 shrink-0">
            <div className="tabular-nums text-[13px] font-medium text-[#4A4455]">
              <span className="text-[#151C27] font-semibold">{doneCount}</span> of{' '}
              <span className="text-[#151C27] font-semibold">{totalCount}</span> completed
              <span className="text-[#CCC3D7] mx-1.5" aria-hidden="true">
                ·
              </span>
              <span className="text-[#6D28D9] font-semibold">{completionPct}%</span>
            </div>
            <div className="h-1.5 w-full sm:w-44 overflow-hidden rounded-full bg-[#EAE5F8]">
              <div
                className="h-full rounded-full bg-[#6D28D9] transition-all duration-300 ease-out"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Inline Quick Add Bar */}
        <form onSubmit={handleQuickAdd} className="mt-5 pt-5 border-t border-[#E5DEFF]/60">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Plus className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7C3AED]" />
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="Capture a task for Today..."
                aria-label="Capture a task for Today"
                className="taskora-input h-10 w-full rounded-lg pl-9 pr-3 text-[14px] text-[#151C27] placeholder:text-[#9CA3AF]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={quickProjectId}
                onChange={(e) => setQuickProjectId(e.target.value)}
                aria-label="Select project for new task"
                className="taskora-input h-10 rounded-lg px-2.5 text-[13px] text-[#4A4455]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                value={quickPriority}
                onChange={(e) => setQuickPriority(e.target.value as TaskPriority)}
                aria-label="Select priority for new task"
                className="taskora-input h-10 rounded-lg px-2.5 text-[13px] text-[#4A4455]"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>

              <button
                type="submit"
                disabled={!quickTitle.trim()}
                className="h-10 rounded-lg bg-[#6D28D9] px-4 text-[13px] font-medium text-white hover:bg-[#5B21B6] disabled:opacity-45 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0"
              >
                Add Task
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* High Priority Focus Group */}
      {highFocus.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-display text-[13px] font-semibold tracking-[-0.01em] text-[#4A4455]">
              Priority Focus
              <span className="ml-2 font-sans text-[12px] font-medium text-[#7B7486] tabular-nums">
                {highFocus.length}
              </span>
            </h3>
          </div>
          <div className="overflow-hidden rounded-xl border border-[#E5DEFF]/75 bg-white divide-y divide-[#E5DEFF]/55 elevation-1">
            {highFocus.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                project={projects.find((p) => p.id === task.projectId)}
                assignee={members.find((m) => m.id === task.assigneeId)}
                isSelected={selectedTaskId === task.id}
                onSelect={onSelectTask}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        </section>
      )}

      {/* Scheduled Today */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-display text-[13px] font-semibold tracking-[-0.01em] text-[#4A4455]">
            Scheduled Today
            <span className="ml-2 font-sans text-[12px] font-medium text-[#7B7486] tabular-nums">
              {scheduledToday.length}
            </span>
          </h3>
        </div>

        {scheduledToday.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-[#E5DEFF]/75 bg-white divide-y divide-[#E5DEFF]/55 elevation-1">
            {scheduledToday.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                project={projects.find((p) => p.id === task.projectId)}
                assignee={members.find((m) => m.id === task.assigneeId)}
                isSelected={selectedTaskId === task.id}
                onSelect={onSelectTask}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        ) : (
          highFocus.length === 0 && (
            <div className="rounded-xl border border-[#E5DEFF]/75 bg-white p-10 text-center elevation-1">
              <p className="font-display text-[16px] font-semibold text-[#151C27]">
                All clear for today
              </p>
              <p className="mt-1 text-[13.5px] text-[#6B7280]">
                Every scheduled item is wrapped up. Use the bar above to capture something new.
              </p>
            </div>
          )
        )}
      </section>

      {/* Completed Today Collapsible Section */}
      {completedToday.length > 0 && (
        <section className="space-y-2.5">
          <button
            type="button"
            onClick={() => setShowCompleted((v) => !v)}
            className="flex items-center gap-1.5 px-1 text-[13px] font-medium text-[#6B7280] hover:text-[#151C27] transition-colors"
          >
            {showCompleted ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            <span>Completed Today</span>
            <span className="tabular-nums text-[12px] text-[#7B7486] ml-1">
              {completedToday.length}
            </span>
          </button>

          {showCompleted && (
            <div className="overflow-hidden rounded-xl border border-[#E5DEFF]/60 bg-white/80 divide-y divide-[#E5DEFF]/45">
              {completedToday.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  project={projects.find((p) => p.id === task.projectId)}
                  assignee={members.find((m) => m.id === task.assigneeId)}
                  isSelected={selectedTaskId === task.id}
                  onSelect={onSelectTask}
                  onToggleComplete={onToggleComplete}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
