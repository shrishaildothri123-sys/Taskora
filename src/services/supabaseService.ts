import { getSupabaseClient } from '../lib/supabase';
import { Member, Project, Task } from '../types';

// ==========================================
// DB <-> Application Data Mappers
// ==========================================

export interface DbTask {
  id: string;
  key: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  project_id: string | null;
  assignee_id: string | null;
  due_date: string;
  is_today: boolean;
  is_inbox: boolean;
  subtasks: any;
  comments: any;
  created_at: string;
  updated_at: string;
}

export interface DbProject {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface DbMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatar_bg: string;
  avatar_text: string;
}

export function mapTaskFromDb(row: DbTask): Task {
  return {
    id: row.id,
    key: row.key,
    title: row.title,
    description: row.description || '',
    status: row.status as Task['status'],
    priority: row.priority as Task['priority'],
    projectId: row.project_id || '',
    assigneeId: row.assignee_id || '',
    dueDate: row.due_date || '',
    isToday: Boolean(row.is_today),
    isInbox: Boolean(row.is_inbox),
    subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
    comments: Array.isArray(row.comments) ? row.comments : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTaskToDb(task: Task): Partial<DbTask> {
  return {
    id: task.id,
    key: task.key,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    project_id: task.projectId || null,
    assignee_id: task.assigneeId || null,
    due_date: task.dueDate || '',
    is_today: task.isToday,
    is_inbox: task.isInbox,
    subtasks: task.subtasks || [],
    comments: task.comments || [],
    created_at: task.createdAt,
    updated_at: task.updatedAt,
  };
}

export function mapProjectFromDb(row: DbProject): Project {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    description: row.description || '',
  };
}

export function mapProjectToDb(proj: Project): DbProject {
  return {
    id: proj.id,
    name: proj.name,
    color: proj.color,
    description: proj.description,
  };
}

export function mapMemberFromDb(row: DbMember): Member {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    initials: row.initials,
    avatarBg: row.avatar_bg,
    avatarText: row.avatar_text,
  };
}

export function mapMemberToDb(mem: Member): DbMember {
  return {
    id: mem.id,
    name: mem.name,
    role: mem.role,
    initials: mem.initials,
    avatar_bg: mem.avatarBg,
    avatar_text: mem.avatarText,
  };
}

// ==========================================
// TASKS CRUD OPERATIONS
// ==========================================

export async function fetchTasks(): Promise<Task[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured');

  const { data, error } = await client
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks from Supabase:', error);
    throw error;
  }

  return (data || []).map(mapTaskFromDb);
}

export async function createTask(task: Task): Promise<Task> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured');

  const dbPayload = mapTaskToDb(task);
  const { data, error } = await client
    .from('tasks')
    .insert([dbPayload])
    .select()
    .single();

  if (error) {
    console.error('Error creating task in Supabase:', error);
    throw error;
  }

  return mapTaskFromDb(data);
}

export async function updateTask(id: string, patch: Partial<Task>): Promise<Task> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured');

  const dbPatch: Partial<DbTask> = {};
  if (patch.title !== undefined) dbPatch.title = patch.title;
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.priority !== undefined) dbPatch.priority = patch.priority;
  if (patch.projectId !== undefined) dbPatch.project_id = patch.projectId || null;
  if (patch.assigneeId !== undefined) dbPatch.assignee_id = patch.assigneeId || null;
  if (patch.dueDate !== undefined) dbPatch.due_date = patch.dueDate;
  if (patch.isToday !== undefined) dbPatch.is_today = patch.isToday;
  if (patch.isInbox !== undefined) dbPatch.is_inbox = patch.isInbox;
  if (patch.subtasks !== undefined) dbPatch.subtasks = patch.subtasks;
  if (patch.comments !== undefined) dbPatch.comments = patch.comments;
  dbPatch.updated_at = new Date().toISOString();

  const { data, error } = await client
    .from('tasks')
    .update(dbPatch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating task ${id} in Supabase:`, error);
    throw error;
  }

  return mapTaskFromDb(data);
}

export async function deleteTask(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured');

  const { error } = await client.from('tasks').delete().eq('id', id);

  if (error) {
    console.error(`Error deleting task ${id} from Supabase:`, error);
    throw error;
  }
}

// ==========================================
// PROJECTS CRUD OPERATIONS
// ==========================================

export async function fetchProjects(): Promise<Project[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured');

  const { data, error } = await client
    .from('projects')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching projects from Supabase:', error);
    throw error;
  }

  return (data || []).map(mapProjectFromDb);
}

export async function createProject(project: Project): Promise<Project> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured');

  const dbPayload = mapProjectToDb(project);
  const { data, error } = await client
    .from('projects')
    .insert([dbPayload])
    .select()
    .single();

  if (error) {
    console.error('Error creating project in Supabase:', error);
    throw error;
  }

  return mapProjectFromDb(data);
}

export async function updateProject(id: string, patch: Partial<Project>): Promise<Project> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured');

  const dbPatch: Partial<DbProject> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.color !== undefined) dbPatch.color = patch.color;
  if (patch.description !== undefined) dbPatch.description = patch.description;

  const { data, error } = await client
    .from('projects')
    .update(dbPatch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating project ${id} in Supabase:`, error);
    throw error;
  }

  return mapProjectFromDb(data);
}

export async function deleteProject(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured');

  const { error } = await client.from('projects').delete().eq('id', id);

  if (error) {
    console.error(`Error deleting project ${id} from Supabase:`, error);
    throw error;
  }
}

// ==========================================
// MEMBERS READ / SEED OPERATIONS
// ==========================================

export async function fetchMembers(): Promise<Member[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured');

  const { data, error } = await client.from('members').select('*');

  if (error) {
    console.error('Error fetching members from Supabase:', error);
    throw error;
  }

  return (data || []).map(mapMemberFromDb);
}

// ==========================================
// SEEDING HELPER
// ==========================================

export async function seedInitialData(
  projects: Project[],
  members: Member[],
  tasks: Task[]
): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, message: 'Supabase client is not available.' };

  try {
    // 1. Members
    const dbMembers = members.map(mapMemberToDb);
    const { error: memErr } = await client
      .from('members')
      .upsert(dbMembers, { onConflict: 'id' });
    if (memErr) throw memErr;

    // 2. Projects
    const dbProjects = projects.map(mapProjectToDb);
    const { error: projErr } = await client
      .from('projects')
      .upsert(dbProjects, { onConflict: 'id' });
    if (projErr) throw projErr;

    // 3. Tasks
    const dbTasks = tasks.map(mapTaskToDb);
    const { error: taskErr } = await client
      .from('tasks')
      .upsert(dbTasks, { onConflict: 'id' });
    if (taskErr) throw taskErr;

    return {
      success: true,
      message: `Successfully seeded ${members.length} members, ${projects.length} projects, and ${tasks.length} tasks!`,
    };
  } catch (err: any) {
    console.error('Error seeding data to Supabase:', err);
    return {
      success: false,
      message: err.message || 'Failed to seed data to Supabase.',
    };
  }
}

// ==========================================
// REALTIME SUBSCRIPTION
// ==========================================

export function subscribeToRealtime(callbacks: {
  onTaskChange?: () => void;
  onProjectChange?: () => void;
}): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};

  const channel = client
    .channel('taskora_live_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks' },
      () => {
        callbacks.onTaskChange?.();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'projects' },
      () => {
        callbacks.onProjectChange?.();
      }
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}

