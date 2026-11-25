# Supabase Integration for Taskora

This guide explains how Taskora is connected to Supabase and how CRUD operations are configured.

---

## 1. Quick Setup (2 Steps)

### Step 1: Run the Database Schema
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** &rarr; **New Query**.
3. Copy the contents of [`supabase/schema.sql`](file:///c:/Users/Shrishail%20Dothri/.vscode/Taskora/supabase/schema.sql) and click **Run**.
   - This creates `tasks`, `projects`, and `members` tables.
   - It configures Row Level Security (RLS) policies allowing public access with the anon key.
   - It enables real-time replication on `tasks` and `projects`.
   - It seeds initial starter data.

### Step 2: Connect Taskora
You have two easy ways to connect:

#### Option A: In-App Connection Modal (No restart required)
1. In the Taskora top navigation bar, click the **Connect DB** button.
2. Enter your **Supabase URL** and **Anon Key** (found in *Supabase Dashboard &rarr; Project Settings &rarr; API*).
3. Click **Save & Test Connection**.
4. Once connected, you can also click **Seed Database** to sync your active workspace data.

#### Option B: Environment Variables
Create a `.env.local` file in the project root:
```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

---

## 2. CRUD Operations Architecture

All CRUD operations are implemented in [`src/services/supabaseService.ts`](file:///c:/Users/Shrishail%20Dothri/.vscode/Taskora/src/services/supabaseService.ts) and orchestrated inside [`src/App.tsx`](file:///c:/Users/Shrishail%20Dothri/.vscode/Taskora/src/App.tsx):

### Tasks
- **Create**: `supabaseCreateTask(task)` — Inserts a new task with JSONB subtasks and comments.
- **Read**: `supabaseFetchTasks()` — Reads all tasks ordered by creation time; automatically updates state on mount and via real-time triggers.
- **Update**: `supabaseUpdateTask(taskId, patch)` — Updates task properties:
  - Status transitions (drag & drop in Kanban board or completion toggle)
  - Title, description, priority, due date, assignee, isToday, isInbox
  - Subtask toggle, add, delete
  - Task comments
- **Delete**: `supabaseDeleteTask(taskId)` — Deletes the task from Supabase.
- **Duplicate**: Clones the task and inserts it into Supabase via `supabaseCreateTask`.

### Projects
- **Create**: `supabaseCreateProject(project)` — Adds a new project with custom color and description.
- **Read**: `supabaseFetchProjects()` — Loads projects on startup and via real-time updates.
- **Delete**: `deleteProject(projectId)` — Removes a project.

### Members
- **Read**: `supabaseFetchMembers()` — Loads team members.

### Realtime Synchronization
- `subscribeToRealtime(...)` connects to Supabase's WebSocket channel (`taskora_live_changes`) so any task changes or project additions sync immediately across browser tabs and devices.

### Offline & Fallback Resiliency
- If Supabase credentials are not provided or if the network is disconnected, Taskora continues functioning seamlessly using `localStorage` without interruption.

