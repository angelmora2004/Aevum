<div align="center">

# Aevum
<img width="1983" height="793" alt="image" src="https://github.com/user-attachments/assets/591bca7d-d41d-42bf-af39-330a44687452" />

**Premium productivity suite with liquid glass design**

Smart task management, notes, calendar, pomodoro timer, and AI assistant — all wrapped in a liquid glass aesthetic.

[![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

</div>

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/angelmora2004/aevum.git
cd aevum

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your keys

# 4. Run
npm run dev
```

App available at `http://localhost:5173`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEON_DATABASE_URL` | Yes | PostgreSQL connection string ([NeonDB](https://neon.tech)) |
| `GROQ_API_KEY` | Yes | Groq API key for AI chat ([console.groq.com](https://console.groq.com)) |
| `ALLOWED_ORIGIN` | No | CORS origin (default: `http://localhost:5173`) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | API server + Vite dev server concurrently |
| `npm run dev:client` | Vite dev server only |
| `npm run dev:server` | Express API server only |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |

---

## Features

### Dashboard
Time-based greeting, today's tasks overview, quick actions, recent notes, smart productivity suggestions, and feature showcase.

### Task Management
- CRUD with subtasks, priorities (low/medium/high), categories, due dates
- Recurring tasks (daily/weekly/monthly)
- Time tracking (estimated vs spent)
- Drag & drop reorder, swipe gestures on mobile
- Confetti celebration on complete

### Notes
- Rich content with pin/unpin, color coding, JSONB tags
- Templates: Blank, Meeting, Idea, Daily, Project, Journal
- Sort order and search

### Calendar
Month and week views with event creation (title, description, time range, all-day support).

### Pomodoro Timer
25/5/15 work/break/long break cycle with session tracking, task linking, and sound effects.

### AI Assistant
Context-aware chat powered by Groq (Llama 3.3 70B). Creates, updates, and deletes tasks/notes via natural language. Bilingual (ES/EN).

### Smart Suggestions
Overdue task warnings, peak productivity analysis, category insights, workload alerts.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vue 3.5 (Composition API) |
| Styling | Tailwind CSS 4 + CSS variables |
| State | Pinia 3.0 |
| Build | Vite 6 |
| PWA | vite-plugin-pwa (Workbox) |
| Backend | Express 5.1 |
| Database | NeonDB (PostgreSQL serverless) |
| AI | Groq API — Llama 3.3 70B |
| Typography | Geist Sans + Mono |

## Database Schema

```
tasks        — id, parent_id, title, description, completed, priority,
               due_date, category, color, is_recurring, recurring_type,
               time_spent, time_estimated, sort_order, user_id

notes        — id, title, content, color, tags (JSONB), pinned,
               template_id, sort_order, user_id

events       — id, title, description, start_date, end_date,
               color, all_day, user_id

pomodoro     — id, task_id, duration, completed, user_id
_sessions
```

---

## Security

| Feature | Detail |
|---------|--------|
| Rate limiting | 15 req/min (AI), 30 req/min (DB) |
| CSRF | Origin/Referer validation on state-changing requests |
| Prompt injection | 20+ regex patterns (EN + ES) |
| Input validation | Server-enforced field length limits |
| XSS protection | DOMPurify sanitization on client |
| Error handling | Generic messages, no internal details leaked |
| Body limit | 10KB max on Express JSON parser |

## Architecture

```
src/
├── assets/          # CSS variables, themes, animations
├── components/
│   ├── chat/        # ChatBot with AI action parsing
│   ├── layout/      # Sidebar, AppLayout
│   ├── pomodoro/    # Timer with SVG ring progress
│   └── ui/          # CustomDateTimePicker, CustomSelect, UndoToast
├── composables/     # 12 composables (theme, i18n, sound, etc.)
├── data/            # Templates, static data
├── router/          # Vue Router config
├── stores/          # Pinia stores (tasks, notes, app)
├── utils/           # Data management, helpers
└── views/           # Dashboard, Tasks, Notes, Calendar, Settings

api/                 # Vercel serverless functions
├── db.js            # CRUD API
├── prompts.js       # AI system prompts
└── chat.js          # Chat endpoint

server.js            # Express dev server (port 3001)
```

---

## License

MIT
