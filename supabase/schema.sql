-- ==============================================================================
-- TASKORA SUPABASE DATABASE SCHEMA
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Create Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Members Table
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    initials TEXT NOT NULL,
    avatar_bg TEXT NOT NULL,
    avatar_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL CHECK (status IN ('backlog', 'in_progress', 'in_review', 'done')),
    priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
    assignee_id TEXT REFERENCES public.members(id) ON DELETE SET NULL,
    due_date TEXT DEFAULT '',
    is_today BOOLEAN DEFAULT false,
    is_inbox BOOLEAN DEFAULT false,
    subtasks JSONB DEFAULT '[]'::jsonb,
    comments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 5. Create Permissive Policies (for client anon key usage)
-- If you implement Supabase Auth later, you can restrict these to authenticated users.
DROP POLICY IF EXISTS "Public full access to projects" ON public.projects;
CREATE POLICY "Public full access to projects" ON public.projects
    FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to members" ON public.members;
CREATE POLICY "Public full access to members" ON public.members
    FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to tasks" ON public.tasks;
CREATE POLICY "Public full access to tasks" ON public.tasks
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6. Enable Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- 7. Seed Initial Workspace Data (Optional / Default)
INSERT INTO public.members (id, name, role, initials, avatar_bg, avatar_text)
VALUES
  ('m-maya', 'Maya Lin', 'Design Lead', 'ML', '#EDE9FE', '#5B21B6'),
  ('m-julian', 'Julian Ross', 'Staff Engineer', 'JR', '#E0F2FE', '#0369A1'),
  ('m-elena', 'Elena Vance', 'Product Manager', 'EV', '#FCE7F3', '#9D174D'),
  ('m-soren', 'Soren Lindqvist', 'Frontend Architect', 'SL', '#D1FAE5', '#065F46')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;

INSERT INTO public.projects (id, name, color, description)
VALUES
  ('proj-launch', 'Product Launch', '#6D28D9', 'Q4 release readiness, pricing page polish, and customer onboarding milestones.'),
  ('proj-design', 'Design System', '#4F46E5', 'Core typography tokens, elevation layers, and accessible component primitives.'),
  ('proj-eng', 'Engineering', '#0284C7', 'Sync engine performance, offline queue resilience, and keyboard navigation.'),
  ('proj-personal', 'Personal Focus', '#059669', 'Weekly planning, design reviews, and uninterrupted deep-work rituals.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  color = EXCLUDED.color,
  description = EXCLUDED.description;

INSERT INTO public.tasks (id, key, title, description, status, priority, project_id, assignee_id, due_date, is_today, is_inbox, subtasks, comments, created_at, updated_at)
VALUES
  (
    't-101', 'TSK-101', 'Finalize keyboard shortcut map for Command Palette',
    'Audit all global shortcuts (Cmd+K, C for compose, arrow navigation) to ensure zero conflicts with browser navigation or text inputs.',
    'in_progress', 'high', 'proj-design', 'm-maya', '2026-11-24', true, false,
    '[{"id":"st-1","title":"Verify Cmd+K / Ctrl+K cross-platform binding","completed":true},{"id":"st-2","title":"Add escape key dismissal on nested drawers","completed":true},{"id":"st-3","title":"Document shortcut legend in inspector footer","completed":false}]'::jsonb,
    '[{"id":"c-1","authorId":"m-soren","body":"Tested on macOS Safari and Chrome — single-key shortcuts now cleanly ignore active textareas.","createdAt":"2h ago"},{"id":"c-2","authorId":"m-maya","body":"Great, let us verify the border-inset lavender styling on Kbd pills before merging.","createdAt":"45m ago"}]'::jsonb,
    '2026-11-20T09:30:00Z', '2026-11-24T08:15:00Z'
  ),
  (
    't-102', 'TSK-102', 'Optimize optimistic sync batching for task reordering',
    'Coalesce rapid drag-and-drop position updates into a single transactional payload so Kanban column moves feel instantaneous.',
    'in_progress', 'high', 'proj-eng', 'm-julian', '2026-11-24', true, false,
    '[{"id":"st-4","title":"Benchmark 200-card column reorder latency","completed":true},{"id":"st-5","title":"Add rollback handler on offline conflict","completed":false}]'::jsonb,
    '[{"id":"c-3","authorId":"m-julian","body":"Frame time dropped from 14ms to 2.1ms with fractional indexing.","createdAt":"3h ago"}]'::jsonb,
    '2026-11-21T11:00:00Z', '2026-11-24T07:50:00Z'
  ),
  (
    't-103', 'TSK-103', 'Review onboarding welcome flow copy with Elena',
    'Tighten the three-step workspace setup prompts so new product teams reach their first active board in under 45 seconds.',
    'in_review', 'medium', 'proj-launch', 'm-elena', '2026-11-24', true, false,
    '[{"id":"st-6","title":"Trim step 2 checklist copy by 30%","completed":true},{"id":"st-7","title":"Align empty-state CTA labels","completed":true}]'::jsonb,
    '[]'::jsonb,
    '2026-11-22T14:20:00Z', '2026-11-24T06:40:00Z'
  ),
  (
    't-104', 'TSK-104', 'Prepare Tuesday afternoon deep-work reading notes',
    'Summarize key takeaways from the Q4 customer discovery interviews ahead of tomorrow morning product sync.',
    'backlog', 'low', 'proj-personal', 'm-maya', '2026-11-24', true, true,
    '[{"id":"st-8","title":"Highlight top 3 recurring friction points","completed":false}]'::jsonb,
    '[]'::jsonb,
    '2026-11-24T07:00:00Z', '2026-11-24T07:00:00Z'
  ),
  (
    't-105', 'TSK-105', 'Ship violet-tinted elevation tokens across card surfaces',
    'Replace neutral gray shadows with soft rgba(109, 40, 217, 0.04) ambient elevation levels across cards, flyouts, and modals.',
    'done', 'medium', 'proj-design', 'm-soren', '2026-11-24', true, false,
    '[{"id":"st-9","title":"Define Level 1, 2, and 3 shadow tokens","completed":true},{"id":"st-10","title":"Verify WCAG contrast on #F4F2FB canvas","completed":true}]'::jsonb,
    '[]'::jsonb,
    '2026-11-19T10:15:00Z', '2026-11-24T05:30:00Z'
  )
ON CONFLICT (id) DO NOTHING;

