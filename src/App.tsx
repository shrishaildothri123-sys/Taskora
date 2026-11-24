import { useEffect, useMemo, useState } from 'react';
import { BoardView } from './components/BoardView';
import { CommandPalette } from './components/CommandPalette';
import { NewTaskModal } from './components/NewTaskModal';
import { Sidebar } from './components/Sidebar';
import { TaskInspector } from './components/TaskInspector';
import { TaskListView } from './components/TaskListView';
import { TodayView } from './components/TodayView';
import { TopBar } from './components/TopBar';
import {
  INITIAL_MEMBERS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  TODAY_ISO,
} from './data/initialData';
import { DisplayMode, Project, Task, TaskPriority, TaskStatus, ViewId } from './types';

const STORAGE_TASKS_KEY = 'taskora_tasks_v1';
const STORAGE_PROJECTS_KEY = 'taskora_projects_v1';

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadStored(STORAGE_TASKS_KEY, INITIAL_TASKS));
  const [projects, setProjects] = useState<Project[]>(() =>
    loadStored(STORAGE_PROJECTS_KEY, INITIAL_PROJECTS)
  );
  const members = INITIAL_MEMBERS;
  const currentUser = members[0];

  const [activeView, setActiveView] = useState<ViewId>('today');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    INITIAL_TASKS[0]?.id ?? null
  );
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [newTaskModalOpen, setNewTaskModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
    } catch {
      // Ignore storage quota errors
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    } catch {
      // Ignore storage quota errors
    }
  }, [projects]);

  // Global keyboard shortcuts (Cmd/Ctrl+K for Command Palette, C for Compose)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((open) => !open);
        return;
      }

      const target = e.target as HTMLElement | null;
      const isEditingText =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      if (!isEditingText && !commandPaletteOpen && !newTaskModalOpen && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setNewTaskModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, newTaskModalOpen]);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeView),
    [projects, activeView]
  );

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId]
  );

  const nextTaskKey = () => {
    const maxNum = tasks.reduce((acc, task) => {
      const match = task.key.match(/TSK-(\d+)/);
      return match ? Math.max(acc, Number(match[1])) : acc;
    }, 100);
    return `TSK-${maxNum + 1}`;
  };

  // Task Mutations
  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setInspectorOpen(true);
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const nextStatus: TaskStatus = task.status === 'done' ? 'in_progress' : 'done';
        return {
          ...task,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const handleUpdateTask = (taskId: string, patch: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, ...patch, updatedAt: new Date().toISOString() }
          : task
      )
    );
  };

  const handleMoveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    handleUpdateTask(taskId, { status: newStatus });
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          subtasks: task.subtasks.map((sub) =>
            sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
          ),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const handleAddSubtask = (taskId: string, title: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          subtasks: [
            ...task.subtasks,
            { id: `st-${Date.now()}`, title, completed: false },
          ],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          subtasks: task.subtasks.filter((sub) => sub.id !== subtaskId),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const handleAddComment = (taskId: string, body: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          comments: [
            ...task.comments,
            {
              id: `c-${Date.now()}`,
              authorId: currentUser.id,
              body,
              createdAt: 'Just now',
            },
          ],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const handleCreateTask = (payload: {
    title: string;
    description?: string;
    projectId: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    dueDate?: string;
    isToday?: boolean;
    isInbox?: boolean;
  }) => {
    const now = new Date().toISOString();
    const created: Task = {
      id: `t-${Date.now()}`,
      key: nextTaskKey(),
      title: payload.title,
      description: payload.description ?? '',
      status: payload.status ?? 'backlog',
      priority: payload.priority ?? 'medium',
      projectId: payload.projectId,
      assigneeId: payload.assigneeId ?? currentUser.id,
      dueDate: payload.dueDate ?? (payload.isToday ? TODAY_ISO : ''),
      isToday: Boolean(payload.isToday),
      isInbox: Boolean(payload.isInbox),
      subtasks: [],
      comments: [],
      createdAt: now,
      updatedAt: now,
    };
    setTasks((prev) => [created, ...prev]);
    setSelectedTaskId(created.id);
    setInspectorOpen(true);
  };

  const handleDuplicateTask = (taskId: string) => {
    const source = tasks.find((t) => t.id === taskId);
    if (!source) return;
    const now = new Date().toISOString();
    const copy: Task = {
      ...source,
      id: `t-${Date.now()}`,
      key: nextTaskKey(),
      title: `${source.title} (Copy)`,
      subtasks: source.subtasks.map((s, idx) => ({ ...s, id: `st-${Date.now()}-${idx}` })),
      comments: [],
      createdAt: now,
      updatedAt: now,
    };
    setTasks((prev) => [copy, ...prev]);
    setSelectedTaskId(copy.id);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => {
      const remaining = prev.filter((t) => t.id !== taskId);
      if (selectedTaskId === taskId) {
        setSelectedTaskId(remaining[0]?.id ?? null);
      }
      return remaining;
    });
  };

  const handleCreateProject = (name: string, color: string) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name,
      color,
      description: `Workspace tasks and milestones for ${name}.`,
    };
    setProjects((prev) => [...prev, newProj]);
    setActiveView(newProj.id);
  };

  const handleResetWorkspace = () => {
    setTasks(INITIAL_TASKS);
    setProjects(INITIAL_PROJECTS);
    setSelectedTaskId(INITIAL_TASKS[0]?.id ?? null);
    setActiveView('today');
    setSearchQuery('');
  };

  // Filter tasks for the active view + global search query
  const viewTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tasks.filter((task) => {
      if (q) {
        const matchesQuery =
          task.title.toLowerCase().includes(q) ||
          task.key.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (activeView === 'today') return task.isToday;
      if (activeView === 'inbox') return task.isInbox;
      if (activeView === 'upcoming') return Boolean(task.dueDate);
      if (activeView === 'all' || activeView === 'board') return true;
      return task.projectId === activeView;
    });
  }, [tasks, searchQuery, activeView]);

  const showModeToggle = activeView === 'all' || Boolean(activeProject);
  const isBoardRendered =
    activeView === 'board' || (showModeToggle && displayMode === 'board');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F4F2FB] text-[#151C27]">
      {/* Left Navigation Rail */}
      <Sidebar
        activeView={activeView}
        onSelectView={(view) => {
          setActiveView(view);
          if (view === 'board') {
            setDisplayMode('board');
          }
        }}
        projects={projects}
        tasks={tasks}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onCreateProject={handleCreateProject}
        onResetWorkspace={handleResetWorkspace}
        currentUser={currentUser}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Center Workspace Column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar
          activeView={activeView}
          activeProject={activeProject}
          displayMode={displayMode}
          onChangeDisplayMode={setDisplayMode}
          showModeToggle={showModeToggle}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNewTask={() => setNewTaskModalOpen(true)}
          inspectorOpen={inspectorOpen}
          onToggleInspector={() => setInspectorOpen((o) => !o)}
          hasSelectedTask={Boolean(selectedTask)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          {activeView === 'today' && !isBoardRendered ? (
            <TodayView
              tasks={viewTasks}
              projects={projects}
              members={members}
              selectedTaskId={selectedTaskId}
              onSelectTask={handleSelectTask}
              onToggleComplete={handleToggleComplete}
              onQuickAddTask={(payload) =>
                handleCreateTask({
                  ...payload,
                  dueDate: TODAY_ISO,
                  status: 'backlog',
                })
              }
            />
          ) : isBoardRendered ? (
            <BoardView
              title={activeProject ? activeProject.name : 'Workflow Board'}
              subtitle={
                activeProject
                  ? activeProject.description
                  : 'Drag cards across columns to update task progress in real time.'
              }
              activeProject={activeProject}
              tasks={viewTasks}
              projects={projects}
              members={members}
              selectedTaskId={selectedTaskId}
              onSelectTask={handleSelectTask}
              onToggleComplete={handleToggleComplete}
              onMoveTaskStatus={handleMoveTaskStatus}
              onQuickAddTask={(payload) => handleCreateTask(payload)}
            />
          ) : (
            <TaskListView
              activeView={activeView}
              activeProject={activeProject}
              tasks={viewTasks}
              projects={projects}
              members={members}
              selectedTaskId={selectedTaskId}
              onSelectTask={handleSelectTask}
              onToggleComplete={handleToggleComplete}
              onQuickAddTask={(payload) => handleCreateTask(payload)}
            />
          )}
        </main>
      </div>

      {/* Right Context Inspector */}
      <TaskInspector
        task={selectedTask}
        projects={projects}
        members={members}
        currentUser={currentUser}
        isOpen={inspectorOpen && Boolean(selectedTask)}
        onClose={() => setInspectorOpen(false)}
        onUpdateTask={handleUpdateTask}
        onToggleComplete={handleToggleComplete}
        onToggleSubtask={handleToggleSubtask}
        onAddSubtask={handleAddSubtask}
        onDeleteSubtask={handleDeleteSubtask}
        onAddComment={handleAddComment}
        onDuplicateTask={handleDuplicateTask}
        onDeleteTask={handleDeleteTask}
      />

      {/* Quick Actions Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        tasks={tasks}
        projects={projects}
        onSelectView={(view) => setActiveView(view)}
        onSelectTask={handleSelectTask}
        onOpenNewTask={() => setNewTaskModalOpen(true)}
        onToggleTaskComplete={handleToggleComplete}
      />

      {/* New Task Composer Modal */}
      <NewTaskModal
        isOpen={newTaskModalOpen}
        onClose={() => setNewTaskModalOpen(false)}
        projects={projects}
        members={members}
        defaultProjectId={activeProject?.id}
        defaultIsToday={activeView === 'today'}
        defaultIsInbox={activeView === 'inbox'}
        onCreateTask={(payload) => handleCreateTask(payload)}
      />
    </div>
  );
}
