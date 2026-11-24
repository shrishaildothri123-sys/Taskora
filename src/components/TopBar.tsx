import React from 'react';
import { Kanban, List, Menu, PanelRight, Plus, Search, X } from 'lucide-react';
import { DisplayMode, Project, ViewId } from '../types';

interface TopBarProps {
  activeView: ViewId;
  activeProject?: Project;
  displayMode: DisplayMode;
  onChangeDisplayMode: (mode: DisplayMode) => void;
  showModeToggle: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenNewTask: () => void;
  inspectorOpen: boolean;
  onToggleInspector: () => void;
  hasSelectedTask: boolean;
  onOpenMobileMenu: () => void;
}

const VIEW_LABELS: Record<string, { section: string; title: string }> = {
  today: { section: 'Workspace', title: 'Today' },
  inbox: { section: 'Workspace', title: 'Inbox' },
  upcoming: { section: 'Workspace', title: 'Upcoming' },
  all: { section: 'Workspace', title: 'All Tasks' },
  board: { section: 'Workspace', title: 'Board' },
};

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  activeProject,
  displayMode,
  onChangeDisplayMode,
  showModeToggle,
  searchQuery,
  onSearchChange,
  onOpenNewTask,
  inspectorOpen,
  onToggleInspector,
  hasSelectedTask,
  onOpenMobileMenu,
}) => {
  const viewInfo = activeProject
    ? { section: 'Projects', title: activeProject.name }
    : VIEW_LABELS[activeView] ?? { section: 'Workspace', title: 'Tasks' };

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-[#E5DEFF]/70 bg-[#F4F2FB]/90 backdrop-blur-md px-4 lg:px-6">
      {/* Left: Mobile Menu Trigger + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="flex md:hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E5DEFF] bg-white text-[#4A4455] hover:bg-[#EAE5F8] hover:text-[#5300B7] transition-colors"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-[13.5px] min-w-0">
          <span className="hidden sm:inline text-[#7B7486] whitespace-nowrap shrink-0">
            {viewInfo.section}
          </span>
          <span className="hidden sm:inline text-[#CCC3D7]" aria-hidden="true">
            /
          </span>
          <div className="flex items-center gap-2 min-w-0">
            {activeProject && (
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                style={{ backgroundColor: activeProject.color }}
                aria-hidden="true"
              />
            )}
            <h1 className="font-display text-[15px] font-semibold tracking-[-0.015em] text-[#151C27] truncate">
              {viewInfo.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Right Controls: Filter Input + Mode Switch + Primary CTA + Inspector Toggle */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Live Filter Input */}
        <div className="relative hidden sm:flex items-center">
          <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter tasks..."
            aria-label="Filter tasks"
            className="taskora-input h-8 w-44 lg:w-56 rounded-lg pl-8 pr-7 text-[13px] text-[#151C27] placeholder:text-[#9CA3AF]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear filter"
              className="absolute right-2 rounded p-0.5 text-[#6B7280] hover:text-[#151C27]"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* List / Board Segmented Control */}
        {showModeToggle && (
          <div
            role="group"
            aria-label="Layout view mode"
            className="flex items-center rounded-lg border border-[#E5DEFF]/80 bg-white p-0.5 elevation-1"
          >
            <button
              type="button"
              onClick={() => onChangeDisplayMode('list')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                displayMode === 'list'
                  ? 'bg-[#EAE5F8] text-[#5300B7]'
                  : 'text-[#6B7280] hover:text-[#151C27]'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeDisplayMode('board')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                displayMode === 'board'
                  ? 'bg-[#EAE5F8] text-[#5300B7]'
                  : 'text-[#6B7280] hover:text-[#151C27]'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Board</span>
            </button>
          </div>
        )}

        {/* Primary CTA */}
        <button
          type="button"
          onClick={onOpenNewTask}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#6D28D9] px-3 text-[13px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-[#5B21B6] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>New Task</span>
        </button>

        {/* Inspector Drawer Toggle */}
        {hasSelectedTask && (
          <button
            type="button"
            onClick={onToggleInspector}
            title={inspectorOpen ? 'Hide inspector' : 'Show inspector'}
            aria-label={inspectorOpen ? 'Hide inspector' : 'Show inspector'}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors shrink-0 ${
              inspectorOpen
                ? 'border-[#DDD6FE] bg-[#EAE5F8] text-[#5300B7]'
                : 'border-[#E5DEFF] bg-white text-[#6B7280] hover:bg-[#F5F3FF] hover:text-[#5300B7]'
            }`}
          >
            <PanelRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  );
};
