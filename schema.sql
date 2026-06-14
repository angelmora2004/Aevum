-- Aevum Database Schema
-- For fresh installs only. Run this in NeonDB SQL Editor.

-- Tasks (subtasks, recurring, time tracking)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  completed BOOLEAN DEFAULT false,
  priority VARCHAR(20) DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  category VARCHAR(100) DEFAULT 'general',
  color VARCHAR(50) DEFAULT 'default',
  is_recurring BOOLEAN DEFAULT false,
  recurring_type VARCHAR(20),
  recurring_interval INTEGER DEFAULT 1,
  time_spent INTEGER DEFAULT 0,
  time_estimated INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes (templates, tags, pin)
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL DEFAULT 'Sin título',
  content TEXT DEFAULT '',
  color VARCHAR(50) DEFAULT 'default',
  tags JSONB DEFAULT '[]',
  pinned BOOLEAN DEFAULT false,
  template_id VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  color VARCHAR(50) DEFAULT 'default',
  all_day BOOLEAN DEFAULT false,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pomodoro sessions
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  duration INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  user_id TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed ASC);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_tasks_sort ON tasks(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_tasks_recurring ON tasks(is_recurring);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(pinned DESC);
CREATE INDEX IF NOT EXISTS idx_notes_sort ON notes(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_date ASC);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_task ON pomodoro_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_user_id ON pomodoro_sessions(user_id);
