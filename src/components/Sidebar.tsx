import React, { useState } from 'react';
import {
  CalendarDays,
  CheckSquare,
  Inbox,
  Kanban,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RotateCcw,
  Search,
  Sun,
  X,
} from 'lucide-react';
import { Member, Project, Task, ViewId } from '../types';
import { MemberAvatar } from './TaskPrimitives';

interface SidebarProps {
  activeView: ViewId;
  onSelectView: (view: ViewId) => void;
  projects: Project[];
  tasks: Task[];
  onOpenCommandPalette: () => void;
  onCreateProject: (name: string, color: string) => void;
  onResetWorkspace: () => void;
  currentUser: Member;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const PROJECT_SWATCHES = ['#6D28D9', '#4F46E5', '#0284C7', '#059669', '#D97706', '#E11D48'];

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  projects,
  tasks,
  onOpenCommandPalette,
  onCreateProject,
  onResetWorkspace,
  currentUser,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const [addingProject, setAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(PROJECT_SWATCHES[0]);

  const activeTasks = tasks.filter((t) => t.status !== 'done');
  const todayCount = activeTasks.filter((t) => t.isToday).length;
  const inboxCount = activeTasks.filter((t) => t.isInbox).length;
  const upcomingCount = activeTasks.filter((t) => Boolean(t.dueDate)).length;
  const allCount = activeTasks.length;

  const navItems: {
    id: ViewId;
    label: string;
    icon: React.FC<{ className?: string }>;
    count?: number;
  }[] = [
    { id: 'today', label: 'Today', icon: Sun, count: todayCount },
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: inboxCount },
    { id: 'upcoming', label: 'Upcoming', icon: CalendarDays, count: upcomingCount },
    { id: 'all', label: 'All Tasks', icon: Layers, count: allCount },
    { id: 'board', label: 'Board', icon: Kanban },
  ];

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newProjectName.trim();
    if (!trimmed) return;
    onCreateProject(trimmed, newProjectColor);
    setNewProjectName('');
    setAddingProject(false);
  };

  const renderSidebarBody = (isMobileDrawer: boolean) => {
    const isCompact = collapsed && !isMobileDrawer;

    return (
      <div className="flex h-full flex-col bg-white border-r border-[#E5DEFF]/70 select-none">
        {/* Brand Row */}
        <div
          className={`flex items-center justify-between px-4 pt-4 pb-3 ${
            isCompact ? 'justify-center px-2' : ''
          }`}
        >
          <button
            type="button"
            onClick={() => {
              onSelectView('today');
              if (isMobileDrawer) onCloseMobile();
            }}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] rounded-lg p-1 -ml-1"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#6D28D9] text-white shadow-sm">
              <CheckSquare className="h-4 w-4 stroke-[2.2]" />
            </span>
            {!isCompact && (
              <span className="font-display text-[17px] font-bold tracking-[-0.025em] text-[#151C27] whitespace-nowrap">
                Taskora
              </span>
            )}
          </button>

          {isMobileDrawer ? (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#EAE5F8] hover:text-[#5300B7] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            !isCompact && (
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
                className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-[#6B7280] hover:bg-[#EDE9FE] hover:text-[#5300B7] transition-colors"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )
          )}
        </div>

        {/* Quick Find Command Bar Trigger */}
        <div className={`px-3 pb-3 ${isCompact ? 'px-2 flex justify-center' : ''}`}>
          {isCompact ? (
            <button
              type="button"
              onClick={onOpenCommandPalette}
              title="Quick Find (Cmd+K)"
              aria-label="Quick Find"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5DEFF] bg-[#F9F9FF] text-[#6B7280] hover:border-[#7C3AED] hover:text-[#5300B7] transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="taskora-input flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[13px] text-[#6B7280] hover:border-[#C4B5FD] hover:text-[#151C27]"
            >
              <span className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-[#7B7486]" />
                <span>Quick Find...</span>
              </span>
              <kbd className="rounded border border-[#E5DEFF] bg-[#F4F2FB] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#4A4455]">
                ⌘K
              </kbd>
            </button>
          )}
        </div>

        {/* Primary Views */}
        <nav aria-label="Workspace views" className="flex-1 overflow-y-auto px-2.5 py-1 space-y-6">
          <div className="space-y-0.5">
            {!isCompact && (
              <div className="px-2.5 pb-1.5 text-[11px] font-semibold tracking-[0.04em] text-[#7B7486]">
                Workspace
              </div>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectView(item.id);
                    if (isMobileDrawer) onCloseMobile();
                  }}
                  title={isCompact ? item.label : undefined}
                  className={`flex w-full items-center rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] ${
                    isCompact ? 'justify-center h-10 px-0' : 'justify-between px-2.5 py-2'
                  } ${
                    isActive
                      ? 'bg-[#EAE5F8] text-[#5300B7] font-medium'
                      : 'text-[#4A4455] hover:bg-[#F4F2FB] hover:text-[#151C27]'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? 'text-[#6D28D9]' : 'text-[#6B7280]'
                      }`}
                    />
                    {!isCompact && (
                      <span className="text-[13.5px] truncate whitespace-nowrap">{item.label}</span>
                    )}
                  </span>
                  {!isCompact && typeof item.count === 'number' && (
                    <span
                      className={`tabular-nums text-[12px] font-medium ${
                        isActive ? 'text-[#5300B7]' : 'text-[#7B7486]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Projects Section */}
          <div className="space-y-0.5">
            {!isCompact && (
              <div className="flex items-center justify-between px-2.5 pb-1.5">
                <span className="text-[11px] font-semibold tracking-[0.04em] text-[#7B7486]">
                  Projects
                </span>
                <button
                  type="button"
                  onClick={() => setAddingProject((v) => !v)}
                  title="New project"
                  aria-label="New project"
                  className="flex h-5 w-5 items-center justify-center rounded text-[#6B7280] hover:bg-[#EDE9FE] hover:text-[#5300B7] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {projects.map((project) => {
              const isActive = activeView === project.id;
              const count = activeTasks.filter((t) => t.projectId === project.id).length;
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    onSelectView(project.id);
                    if (isMobileDrawer) onCloseMobile();
                  }}
                  title={isCompact ? project.name : undefined}
                  className={`flex w-full items-center rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] ${
                    isCompact ? 'justify-center h-10 px-0' : 'justify-between px-2.5 py-2'
                  } ${
                    isActive
                      ? 'bg-[#EAE5F8] text-[#5300B7] font-medium'
                      : 'text-[#4A4455] hover:bg-[#F4F2FB] hover:text-[#151C27]'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                      style={{ backgroundColor: project.color }}
                      aria-hidden="true"
                    />
                    {!isCompact && (
                      <span className="text-[13.5px] truncate whitespace-nowrap">{project.name}</span>
                    )}
                  </span>
                  {!isCompact && (
                    <span
                      className={`tabular-nums text-[12px] font-medium ${
                        isActive ? 'text-[#5300B7]' : 'text-[#7B7486]'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            {!isCompact && addingProject && (
              <form
                onSubmit={handleProjectSubmit}
                className="mt-2 rounded-xl border border-[#E5DEFF] bg-[#F9F9FF] p-2.5 space-y-2"
              >
                <input
                  type="text"
                  autoFocus
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Project name..."
                  className="taskora-input w-full rounded-md px-2.5 py-1.5 text-[13px] text-[#151C27] placeholder:text-[#9CA3AF]"
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {PROJECT_SWATCHES.map((swatch) => (
                      <button
                        key={swatch}
                        type="button"
                        onClick={() => setNewProjectColor(swatch)}
                        aria-label={`Select color ${swatch}`}
                        className={`h-4 w-4 rounded-full transition-transform ${
                          newProjectColor === swatch ? 'scale-110 ring-2 ring-[#6D28D9] ring-offset-1' : ''
                        }`}
                        style={{ backgroundColor: swatch }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setAddingProject(false)}
                      className="rounded px-2 py-1 text-[11px] font-medium text-[#6B7280] hover:bg-[#EAE5F8]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded bg-[#6D28D9] px-2 py-1 text-[11px] font-medium text-white hover:bg-[#5B21B6]"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </nav>

        {/* Bottom Workspace Profile & Collapse */}
        <div className="border-t border-[#E5DEFF]/70 p-2.5">
          {isCompact ? (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Expand sidebar"
                aria-label="Expand sidebar"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#EDE9FE] hover:text-[#5300B7] transition-colors"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
              <MemberAvatar member={currentUser} size="sm" />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <MemberAvatar member={currentUser} size="md" />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-[#151C27] truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-[#6B7280] truncate">{currentUser.role}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onResetWorkspace}
                title="Reset sample workspace"
                aria-label="Reset sample workspace"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#6B7280] hover:bg-[#EDE9FE] hover:text-[#5300B7] transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop & Tablet Fixed Rail */}
      <aside
        className={`hidden md:block shrink-0 transition-[width] duration-200 ease-out ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {renderSidebarBody(false)}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-[#F4F2FB]/70 backdrop-blur-md transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-68 max-w-[82vw] h-full elevation-3">
            {renderSidebarBody(true)}
          </aside>
        </div>
      )}
    </>
  );
};
