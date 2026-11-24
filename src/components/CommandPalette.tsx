import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Inbox,
  Kanban,
  Layers,
  Plus,
  Search,
  Sun,
} from 'lucide-react';
import { Project, Task, ViewId } from '../types';
import { PriorityChip } from './TaskPrimitives';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  projects: Project[];
  onSelectView: (view: ViewId) => void;
  onSelectTask: (taskId: string) => void;
  onOpenNewTask: () => void;
  onToggleTaskComplete: (taskId: string) => void;
}

interface PaletteItem {
  id: string;
  group: 'Actions' | 'Views' | 'Projects' | 'Tasks';
  label: string;
  subtitle?: string;
  shortcut?: string;
  icon?: React.ReactNode;
  task?: Task;
  onExecute: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tasks,
  projects,
  onSelectView,
  onSelectTask,
  onOpenNewTask,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const items = useMemo<PaletteItem[]>(() => {
    const q = query.trim().toLowerCase();

    const baseActions: PaletteItem[] = [
      {
        id: 'act-new',
        group: 'Actions',
        label: 'Create new task',
        shortcut: 'C',
        icon: <Plus className="h-4 w-4 text-[#6D28D9]" />,
        onExecute: () => {
          onClose();
          onOpenNewTask();
        },
      },
    ];

    const viewItems: PaletteItem[] = [
      {
        id: 'view-today',
        group: 'Views',
        label: 'Go to Today',
        shortcut: 'G T',
        icon: <Sun className="h-4 w-4 text-[#6B7280]" />,
        onExecute: () => {
          onSelectView('today');
          onClose();
        },
      },
      {
        id: 'view-inbox',
        group: 'Views',
        label: 'Go to Inbox',
        shortcut: 'G I',
        icon: <Inbox className="h-4 w-4 text-[#6B7280]" />,
        onExecute: () => {
          onSelectView('inbox');
          onClose();
        },
      },
      {
        id: 'view-upcoming',
        group: 'Views',
        label: 'Go to Upcoming Schedule',
        icon: <CalendarDays className="h-4 w-4 text-[#6B7280]" />,
        onExecute: () => {
          onSelectView('upcoming');
          onClose();
        },
      },
      {
        id: 'view-all',
        group: 'Views',
        label: 'Go to All Tasks',
        icon: <Layers className="h-4 w-4 text-[#6B7280]" />,
        onExecute: () => {
          onSelectView('all');
          onClose();
        },
      },
      {
        id: 'view-board',
        group: 'Views',
        label: 'Open Kanban Board',
        shortcut: 'G B',
        icon: <Kanban className="h-4 w-4 text-[#6B7280]" />,
        onExecute: () => {
          onSelectView('board');
          onClose();
        },
      },
    ];

    const projectItems: PaletteItem[] = projects.map((project) => ({
      id: `proj-${project.id}`,
      group: 'Projects',
      label: project.name,
      subtitle: 'Project',
      icon: (
        <span
          className="h-2.5 w-2.5 rounded-[3px]"
          style={{ backgroundColor: project.color }}
        />
      ),
      onExecute: () => {
        onSelectView(project.id);
        onClose();
      },
    }));

    const taskItems: PaletteItem[] = tasks.map((task) => {
      const proj = projects.find((p) => p.id === task.projectId);
      return {
        id: `task-${task.id}`,
        group: 'Tasks',
        label: task.title,
        subtitle: `${task.key}${proj ? ` · ${proj.name}` : ''}`,
        task,
        icon: (
          <CheckCircle2
            className={`h-4 w-4 ${
              task.status === 'done' ? 'text-[#6D28D9]' : 'text-[#9CA3AF]'
            }`}
          />
        ),
        onExecute: () => {
          onSelectTask(task.id);
          onClose();
        },
      };
    });

    const combined = [...baseActions, ...viewItems, ...projectItems, ...taskItems];

    if (!q) {
      return [...baseActions, ...viewItems, ...taskItems.slice(0, 6)];
    }

    return combined.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  }, [query, tasks, projects, onClose, onOpenNewTask, onSelectView, onSelectTask]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (items.length > 0 ? (prev + 1) % items.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          items.length > 0 ? (prev - 1 + items.length) % items.length : 0
        );
      } else if (e.key === 'Enter' && items[selectedIndex]) {
        e.preventDefault();
        items[selectedIndex].onExecute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Blurred Lavender Scrim */}
      <div
        className="fixed inset-0 bg-[#F4F2FB]/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 640px Level 3 Floating Palette */}
      <div className="relative z-10 w-full max-w-[640px] overflow-hidden rounded-2xl border border-[#DDD6FE] bg-white elevation-3">
        {/* Frosted Search Top Bar */}
        <div className="flex items-center gap-3 border-b border-[#E5DEFF]/70 bg-[#F9F9FF]/90 px-4 py-3.5">
          <Search className="h-4 w-4 text-[#7C3AED] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, switch views, or run a command..."
            className="w-full bg-transparent text-[14.5px] text-[#151C27] placeholder:text-[#9CA3AF] focus:outline-none"
          />
          <kbd className="rounded border border-[#E5DEFF] bg-white px-1.5 py-0.5 font-mono text-[10.5px] font-medium text-[#6B7280] shrink-0">
            ESC
          </kbd>
        </div>

        {/* Keyboard-navigable Results */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-[#E5DEFF]/45 py-1.5">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-[13.5px] text-[#6B7280]">
              No matching tasks or commands for “{query}”.
            </div>
          ) : (
            items.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={item.onExecute}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors ${
                    isSelected ? 'bg-[#F5F3FF]' : 'bg-white hover:bg-[#F9F9FF]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <div
                        className={`text-[13.5px] font-medium truncate ${
                          isSelected ? 'text-[#5300B7]' : 'text-[#151C27]'
                        }`}
                      >
                        {item.label}
                      </div>
                      {item.subtitle && (
                        <div className="text-[11.5px] text-[#7B7486] truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.task && <PriorityChip priority={item.task.priority} compact />}
                    {item.shortcut ? (
                      <kbd className="rounded border border-[#DDD6FE] bg-[#F4F2FB] px-1.5 py-0.5 font-mono text-[10.5px] font-medium text-[#5300B7]">
                        {item.shortcut}
                      </kbd>
                    ) : (
                      <span className="text-[11px] font-medium text-[#7B7486]">
                        {item.group}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
