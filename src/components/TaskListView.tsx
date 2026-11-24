import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { TODAY_ISO, TOMORROW_ISO } from '../data/initialData';
import { Member, Project, Task, TaskPriority, TaskStatus, ViewId } from '../types';
import { STATUS_OPTIONS, sortTasks } from '../utils/taskHelpers';
import { TaskRow } from './TaskRow';

interface TaskListViewProps {
  activeView: ViewId;
  activeProject?: Project;
  tasks: Task[];
  projects: Project[];
  members: Member[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onQuickAddTask: (payload: {
    title: string;
    projectId: string;
    status: TaskStatus;
    priority: TaskPriority;
    isInbox: boolean;
    dueDate: string;
  }) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  activeView,
  activeProject,
  tasks,
  projects,
  members,
  selectedTaskId,
  onSelectTask,
  onToggleComplete,
  onQuickAddTask,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'done'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'title'>('priority');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [inlineGroup, setInlineGroup] = useState<string | null>(null);
  const [inlineTitle, setInlineTitle] = useState('');

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const filtered = tasks.filter((task) => {
    if (statusFilter === 'active' && task.status === 'done') return false;
    if (statusFilter === 'done' && task.status !== 'done') return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    return true;
  });

  const sorted = sortTasks(filtered, sortBy);

  const headerMeta = (() => {
    if (activeProject) {
      return {
        title: activeProject.name,
        subtitle: activeProject.description,
      };
    }
    if (activeView === 'inbox') {
      return {
        title: 'Inbox',
        subtitle: 'Newly captured items awaiting triage, scheduling, or project assignment.',
      };
    }
    if (activeView === 'upcoming') {
      return {
        title: 'Upcoming Schedule',
        subtitle: 'Tasks organized by time horizon across today, tomorrow, and the week ahead.',
      };
    }
    return {
      title: 'All Tasks',
      subtitle: 'Complete overview of active and completed work across every project.',
    };
  })();

  const handleInlineSubmit = (e: React.FormEvent, defaultStatus: TaskStatus, defaultDueDate: string) => {
    e.preventDefault();
    const trimmed = inlineTitle.trim();
    if (!trimmed) return;
    onQuickAddTask({
      title: trimmed,
      projectId: activeProject?.id ?? projects[0]?.id ?? 'proj-personal',
      status: defaultStatus,
      priority: priorityFilter === 'all' ? 'medium' : priorityFilter,
      isInbox: activeView === 'inbox',
      dueDate: defaultDueDate,
    });
    setInlineTitle('');
    setInlineGroup(null);
  };

  // Build grouped sections
  const sections: {
    key: string;
    label: string;
    tasks: Task[];
    defaultStatus: TaskStatus;
    defaultDueDate: string;
  }[] =
    activeView === 'upcoming'
      ? [
          {
            key: 'today',
            label: 'Today · Nov 24',
            tasks: sorted.filter((t) => t.dueDate === TODAY_ISO || (t.dueDate && t.dueDate < TODAY_ISO)),
            defaultStatus: 'in_progress',
            defaultDueDate: TODAY_ISO,
          },
          {
            key: 'tomorrow',
            label: 'Tomorrow · Nov 25',
            tasks: sorted.filter((t) => t.dueDate === TOMORROW_ISO),
            defaultStatus: 'backlog',
            defaultDueDate: TOMORROW_ISO,
          },
          {
            key: 'this_week',
            label: 'Later This Week',
            tasks: sorted.filter((t) => t.dueDate > TOMORROW_ISO && t.dueDate <= '2026-11-30'),
            defaultStatus: 'backlog',
            defaultDueDate: '2026-11-27',
          },
          {
            key: 'later',
            label: 'Next Week & Beyond',
            tasks: sorted.filter((t) => !t.dueDate || t.dueDate > '2026-11-30'),
            defaultStatus: 'backlog',
            defaultDueDate: '2026-12-02',
          },
        ]
      : [
          {
            key: 'in_progress',
            label: 'In Progress',
            tasks: sorted.filter((t) => t.status === 'in_progress'),
            defaultStatus: 'in_progress',
            defaultDueDate: TODAY_ISO,
          },
          {
            key: 'in_review',
            label: 'In Review',
            tasks: sorted.filter((t) => t.status === 'in_review'),
            defaultStatus: 'in_review',
            defaultDueDate: TOMORROW_ISO,
          },
          {
            key: 'backlog',
            label: 'Backlog',
            tasks: sorted.filter((t) => t.status === 'backlog'),
            defaultStatus: 'backlog',
            defaultDueDate: '',
          },
          {
            key: 'done',
            label: 'Completed',
            tasks: sorted.filter((t) => t.status === 'done'),
            defaultStatus: 'done',
            defaultDueDate: TODAY_ISO,
          },
        ];

  const visibleSections = sections.filter(
    (s) => s.tasks.length > 0 || inlineGroup === s.key || (statusFilter === 'all' && s.key === 'in_progress')
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header & Filter Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
              {headerMeta.title}
            </h2>
            <span className="tabular-nums text-[13px] font-medium text-[#7B7486]">
              {filtered.length} {filtered.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>
          <p className="text-[13.5px] text-[#4A4455]">{headerMeta.subtitle}</p>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Filter by completion status"
            className="flex items-center rounded-lg border border-[#E5DEFF]/80 bg-white p-0.5 elevation-1"
          >
            {(['all', 'active', 'done'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`rounded-md px-2.5 py-1 text-[12px] font-medium capitalize transition-colors whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-[#EAE5F8] text-[#5300B7]'
                    : 'text-[#6B7280] hover:text-[#151C27]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | TaskPriority)}
            aria-label="Filter by priority"
            className="taskora-input h-8 rounded-lg px-2.5 text-[12.5px] font-medium text-[#4A4455]"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'priority' | 'dueDate' | 'title')}
            aria-label="Sort tasks"
            className="taskora-input h-8 rounded-lg px-2.5 text-[12.5px] font-medium text-[#4A4455]"
          >
            <option value="priority">Sort: Priority</option>
            <option value="dueDate">Sort: Due Date</option>
            <option value="title">Sort: Title</option>
          </select>
        </div>
      </div>

      {/* Grouped Task Sections */}
      {filtered.length === 0 && !inlineGroup ? (
        <div className="rounded-2xl border border-[#E5DEFF]/75 bg-white p-12 text-center elevation-1 space-y-3">
          <p className="font-display text-[17px] font-semibold text-[#151C27]">
            No matching tasks
          </p>
          <p className="text-[13.5px] text-[#6B7280] max-w-md mx-auto">
            No tasks match your current filters in {headerMeta.title}. Clear filters or create a new task below.
          </p>
          <div className="pt-1 flex items-center justify-center gap-2">
            {(statusFilter !== 'all' || priorityFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setPriorityFilter('all');
                }}
                className="h-9 rounded-lg border border-[#DDD6FE] bg-white px-3.5 text-[13px] font-medium text-[#4C1D95] hover:bg-[#F5F3FF] transition-colors"
              >
                Reset Filters
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setInlineGroup('in_progress');
                setInlineTitle('');
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#6D28D9] px-4 text-[13px] font-medium text-white hover:bg-[#5B21B6] transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {visibleSections.map((section) => {
            const isCollapsed = Boolean(collapsedGroups[section.key]);
            return (
              <section key={section.key} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(section.key)}
                    className="flex items-center gap-1.5 text-[13px] font-semibold text-[#4A4455] hover:text-[#151C27] transition-colors"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-3.5 w-3.5 text-[#7B7486]" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-[#7B7486]" />
                    )}
                    <span className="font-display">{section.label}</span>
                    <span className="tabular-nums text-[12px] font-medium text-[#7B7486] ml-1">
                      {section.tasks.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCollapsedGroups((prev) => ({ ...prev, [section.key]: false }));
                      setInlineGroup(section.key);
                      setInlineTitle('');
                    }}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-[#6B7280] hover:bg-[#EAE5F8] hover:text-[#5300B7] transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {!isCollapsed && (
                  <div className="overflow-hidden rounded-xl border border-[#E5DEFF]/75 bg-white divide-y divide-[#E5DEFF]/55 elevation-1">
                    {section.tasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        project={projects.find((p) => p.id === task.projectId)}
                        assignee={members.find((m) => m.id === task.assigneeId)}
                        isSelected={selectedTaskId === task.id}
                        onSelect={onSelectTask}
                        onToggleComplete={onToggleComplete}
                        showProject={!activeProject}
                      />
                    ))}

                    {inlineGroup === section.key && (
                      <form
                        onSubmit={(e) =>
                          handleInlineSubmit(e, section.defaultStatus, section.defaultDueDate)
                        }
                        className="flex items-center gap-2.5 bg-[#F9F9FF] px-4 py-2.5"
                      >
                        <input
                          type="text"
                          autoFocus
                          value={inlineTitle}
                          onChange={(e) => setInlineTitle(e.target.value)}
                          placeholder={`Add task to ${section.label}...`}
                          className="taskora-input h-9 flex-1 rounded-lg px-3 text-[13.5px] text-[#151C27] placeholder:text-[#9CA3AF]"
                        />
                        <button
                          type="button"
                          onClick={() => setInlineGroup(null)}
                          className="h-9 rounded-lg px-3 text-[12.5px] font-medium text-[#6B7280] hover:bg-[#EAE5F8] transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!inlineTitle.trim()}
                          className="h-9 rounded-lg bg-[#6D28D9] px-3.5 text-[12.5px] font-medium text-white hover:bg-[#5B21B6] disabled:opacity-45 transition-colors"
                        >
                          Save
                        </button>
                      </form>
                    )}

                    {section.tasks.length === 0 && inlineGroup !== section.key && (
                      <div className="px-4 py-6 text-center text-[13px] text-[#7B7486]">
                        No tasks in {STATUS_OPTIONS.find((s) => s.value === section.defaultStatus)?.label ?? section.label}.
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
