import { useEffect, useMemo, useState, useCallback } from 'react';
import { BoardView } from './components/BoardView';
import { CommandPalette } from './components/CommandPalette';
import { NewTaskModal } from './components/NewTaskModal';
import { Sidebar } from './components/Sidebar';
import { SupabaseModal } from './components/SupabaseModal';
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
import { getSupabaseConfig } from './lib/supabase';
import {
  createProject as supabaseCreateProject,
  createTask as supabaseCreateTask,
  deleteTask as supabaseDeleteTask,
  fetchMembers as supabaseFetchMembers,
  fetchProjects as supabaseFetchProjects,
  fetchTasks as supabaseFetchTasks,
  seedInitialData,
  subscribeToRealtime,
  updateTask as supabaseUpdateTask,
} from './services/supabaseService';
import { DisplayMode, Member, Project, Task, TaskPriority, TaskStatus, ViewId } from './types';

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
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const currentUser = members[0] || INITIAL_MEMBERS[0];

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
  const [supabaseModalOpen, setSupabaseModalOpen] = useState<boolean>(false);

  // Supabase sync states
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(
    () => getSupabaseConfig().isConfigured
  );
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Helper to show temporary sync notification toast
  const notifySync = (msg: string) => {
    setSyncNotice(msg);
    setTimeout(() => {
      setSyncNotice((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Local Storage persistence backup
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

  // Load from Supabase on mount / config change
  const loadFromSupabase = useCallback(async () => {
    const cfg = getSupabaseConfig();
    if (!cfg.isConfigured) {
      setIsSupabaseConnected(false);
      return;
    }

    try {
      // Fetch projects
      const remoteProjects = await supabaseFetchProjects();
      if (remoteProjects && remoteProjects.length > 0) {
        setProjects(remoteProjects);
      }

      // Fetch members
      try {
        const remoteMembers = await supabaseFetchMembers();
        if (remoteMembers && remoteMembers.length > 0) {
          setMembers(remoteMembers);
        }
      } catch (err) {
        console.warn('Could not fetch members, using defaults:', err);
      }

      // Fetch tasks
      const remoteTasks = await supabaseFetchTasks();
      if (remoteTasks && remoteTasks.length > 0) {
        setTasks(remoteTasks);
        if (!selectedTaskId || !remoteTasks.some((t) => t.id === selectedTaskId)) {
          setSelectedTaskId(remoteTasks[0]?.id ?? null);
        }
      }

      setIsSupabaseConnected(true);
      notifySync('Synced latest data with Supabase');
    } catch (err: any) {
      console.error('Supabase initial fetch failed:', err);
      setIsSupabaseConnected(false);
    }
  }, [selectedTaskId]);

  useEffect(() => {
    loadFromSupabase();
  }, [loadFromSupabase]);

  // Supabase Real-time updates subscription
  useEffect(() => {
    if (!isSupabaseConnected) return;

    const unsubscribe = subscribeToRealtime({
      onTaskChange: async () => {
        try {
          const freshTasks = await supabaseFetchTasks();
          setTasks(freshTasks);
        } catch (err) {
          console.error('Realtime task fetch failed:', err);
        }
      },
      onProjectChange: async () => {
        try {
          const freshProjects = await supabaseFetchProjects();
          setProjects(freshProjects);
        } catch (err) {
          console.error('Realtime project fetch failed:', err);
        }
      },
    });

    return () => {
      unsubscribe();
    };
  }, [isSupabaseConnected]);

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

      if (!isEditingText && !commandPaletteOpen && !newTaskModalOpen && !supabaseModalOpen && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setNewTaskModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, newTaskModalOpen, supabaseModalOpen]);

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

  // ==========================================
  // TASK CRUD MUTATIONS
  // ==========================================

  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setInspectorOpen(true);
  };

  // UPDATE: Status toggle complete
  const handleToggleComplete = async (taskId: string) => {
    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask) return;
    const nextStatus: TaskStatus = currentTask.status === 'done' ? 'in_progress' : 'done';

    // Optimistic local update
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status: nextStatus, updatedAt: new Date().toISOString() }
          : task
      )
    );

    // Supabase update
    if (isSupabaseConnected) {
      try {
        await supabaseUpdateTask(taskId, { status: nextStatus });
      } catch (err: any) {
        notifySync(`Supabase update failed: ${err.message}`);
      }
    }
  };

  // UPDATE: General task patch
  const handleUpdateTask = async (taskId: string, patch: Partial<Task>) => {
    // Optimistic local update
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, ...patch, updatedAt: new Date().toISOString() }
          : task
      )
    );

    // Supabase update
    if (isSupabaseConnected) {
      try {
        await supabaseUpdateTask(taskId, patch);
      } catch (err: any) {
        notifySync(`Supabase update failed: ${err.message}`);
      }
    }
  };

  // UPDATE: Kanban status move
  const handleMoveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    handleUpdateTask(taskId, { status: newStatus });
  };

  // UPDATE: Subtask toggle
  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updatedSubtasks = task.subtasks.map((sub) =>
      sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
    );

    handleUpdateTask(taskId, { subtasks: updatedSubtasks });
  };

  // UPDATE: Subtask add
  const handleAddSubtask = async (taskId: string, title: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updatedSubtasks = [
      ...task.subtasks,
      { id: `st-${Date.now()}`, title, completed: false },
    ];

    handleUpdateTask(taskId, { subtasks: updatedSubtasks });
  };

  // UPDATE: Subtask delete
  const handleDeleteSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updatedSubtasks = task.subtasks.filter((sub) => sub.id !== subtaskId);

    handleUpdateTask(taskId, { subtasks: updatedSubtasks });
  };

  // UPDATE: Add comment
  const handleAddComment = async (taskId: string, body: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updatedComments = [
      ...task.comments,
      {
        id: `c-${Date.now()}`,
        authorId: currentUser.id,
        body,
        createdAt: 'Just now',
      },
    ];

    handleUpdateTask(taskId, { comments: updatedComments });
  };

  // CREATE: New task
  const handleCreateTask = async (payload: {
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

    // Optimistic UI update
    setTasks((prev) => [created, ...prev]);
    setSelectedTaskId(created.id);
    setInspectorOpen(true);

    // Supabase Create
    if (isSupabaseConnected) {
      try {
        await supabaseCreateTask(created);
        notifySync('Task created in Supabase');
      } catch (err: any) {
        notifySync(`Supabase creation failed: ${err.message}`);
      }
    }
  };

  // CREATE: Duplicate task
  const handleDuplicateTask = async (taskId: string) => {
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

    if (isSupabaseConnected) {
      try {
        await supabaseCreateTask(copy);
        notifySync('Task duplicated in Supabase');
      } catch (err: any) {
        notifySync(`Supabase duplication failed: ${err.message}`);
      }
    }
  };

  // DELETE: Delete task
  const handleDeleteTask = async (taskId: string) => {
    // Optimistic UI update
    setTasks((prev) => {
      const remaining = prev.filter((t) => t.id !== taskId);
      if (selectedTaskId === taskId) {
        setSelectedTaskId(remaining[0]?.id ?? null);
      }
      return remaining;
    });

    // Supabase Delete
    if (isSupabaseConnected) {
      try {
        await supabaseDeleteTask(taskId);
        notifySync('Task deleted from Supabase');
      } catch (err: any) {
        notifySync(`Supabase delete failed: ${err.message}`);
      }
    }
  };

  // ==========================================
  // PROJECT CRUD MUTATIONS
  // ==========================================

  const handleCreateProject = async (name: string, color: string) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name,
      color,
      description: `Workspace tasks and milestones for ${name}.`,
    };

    // Optimistic UI update
    setProjects((prev) => [...prev, newProj]);
    setActiveView(newProj.id);

    // Supabase Create
    if (isSupabaseConnected) {
      try {
        await supabaseCreateProject(newProj);
        notifySync('Project created in Supabase');
      } catch (err: any) {
        notifySync(`Supabase project creation failed: ${err.message}`);
      }
    }
  };

  // RESET / RE-SEED WORKSPACE
  const handleResetWorkspace = async () => {
    setTasks(INITIAL_TASKS);
    setProjects(INITIAL_PROJECTS);
    setMembers(INITIAL_MEMBERS);
    setSelectedTaskId(INITIAL_TASKS[0]?.id ?? null);
    setActiveView('today');
    setSearchQuery('');

    if (isSupabaseConnected) {
      const confirmed = window.confirm(
        'Would you also like to reset and re-seed the Supabase database with sample data?'
      );
      if (confirmed) {
        const res = await seedInitialData(INITIAL_PROJECTS, INITIAL_MEMBERS, INITIAL_TASKS);
        notifySync(res.message);
      }
    }
  };

  // Filter tasks for active view + search
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
      {/* Sync Toast Notification */}
      {syncNotice && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-[#DDD6FE] bg-white px-4 py-2.5 text-[13px] font-medium text-[#5300B7] shadow-lg elevation-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="h-2 w-2 rounded-full bg-[#6D28D9] animate-pulse" />
          <span>{syncNotice}</span>
        </div>
      )}

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
          isSupabaseConnected={isSupabaseConnected}
          onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
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

      {/* Supabase Connection & CRUD Settings Modal */}
      <SupabaseModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
        onConfigChange={() => {
          setIsSupabaseConnected(getSupabaseConfig().isConfigured);
          loadFromSupabase();
        }}
        currentProjects={projects}
        currentMembers={members}
        currentTasks={tasks}
      />
    </div>
  );
}
