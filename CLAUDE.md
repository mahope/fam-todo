# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FamTodo is a private, web-based application designed to organize tasks, shopping lists, and daily chores for one or more families. The system supports both shared and private tasks/lists, with special features for adults/children and an intelligent shopping list with automatic categorization.

**Design Principles:**
- **Simple, minimalist, beautifully designed**
- **Mobile-first** (primary platform) with desktop support
- **PWA** with offline support, real-time updates, and infinite login sessions

### Tech Stack
- **Frontend**: Next.js 14 (TypeScript) with shadcn/ui components
- **Backend**: Self-hosted Supabase stack (Postgres, PostgREST, Realtime, Storage)
- **Auth**: BetterAuth for JWT-based authentication with RLS
- **Deployment**: Docker Compose for local development, Dokploy for production

## Important Git Workflow

**ALWAYS commit and push your changes after completing each command or task:**
```bash
git add .
git commit -m "Clear description of changes"
git push
```

## Key Commands

### Development
```bash
# Start all services (DB, PostgREST, Realtime, Storage, Web)
docker compose up -d --build

# Start only web development server (if DB is already running)
cd apps/web && npm run dev

# View logs
docker compose logs -f [service_name]

# Stop all services
docker compose down
```

### Frontend (apps/web)
```bash
npm run dev    # Development server on :3000
npm run build  # Production build
npm run lint   # Run ESLint
```

## Architecture

### Database Schema
The application uses PostgreSQL with Row Level Security (RLS). Key tables:
- `families` - Family groups
- `app_users` - Users with roles (admin/adult/child)
- `folders` - Organizational containers for lists
- `lists` - Task lists with visibility (private/family/adults)
- `tasks` - Individual tasks with assignments and deadlines
- `shopping_items` - Shopping list items with auto-categorization
- `shopping_dictionary` - Product catalog for autocomplete

### JWT Claims Structure
BetterAuth must mint JWTs with these claims for RLS:
```json
{
  "app_user_id": "<uuid>",
  "family_id": "<uuid>",
  "role_name": "admin|adult|child",
  "aud": "postgrest",
  "iss": "famtodo"
}
```

### Service Ports
- Web: 3000
- PostgREST API: 3001
- Realtime WebSocket: 4000
- Storage API: 5000
- PostgreSQL: 5432
- ImgProxy: 5001

### Environment Setup
Copy `.env.example` to `.env` and configure:
- `JWT_SECRET` - Shared between all services
- `POSTGRES_PASSWORD` - Database password
- `BETTERAUTH_SECRET` - BetterAuth signing secret

### RLS Policies
Access control is enforced at the database level:
- Users can only access data from their own family
- Private lists/tasks are visible only to owners
- Adult-only content requires `role IN ('admin', 'adult')`
- All operations check JWT claims via `auth.uid()` and `auth.jwt()`

### Real-time Updates
Supabase Realtime is configured with:
- Publication: `supabase_realtime`
- Logical replication enabled
- JWT authentication required

## Development Workflow

1. **Database changes**: Edit SQL files in `supabase/init/` then restart DB container
2. **API access**: Use PostgREST endpoints at `:3001` with Bearer token
3. **Real-time**: Connect to WebSocket at `:4000/socket` with JWT
4. **File uploads**: Use Storage API at `:5000` for avatars

## Core Features (from PRD)

### User Management & Roles
- **Roles**: Admin, Adult, Child
- Admin can create families and users
- Role-based access control for lists/tasks
- Login via BetterAuth with email/password
- "Remember me" = infinite session (persistent login)

### Lists & Folders
**Visibility levels:**
- **Private**: Only owner sees them
- **Family**: All family members see them
- **Adult**: Only adults in family see them

Both lists and folders support all visibility levels.

### Tasks
**Required fields:**
- Title (mandatory)
- Description
- Deadline
- Recurrence (daily, weekly, monthly, custom)
- Subtasks
- Tags
- Assigned person

**Features:**
- Sorting/filtering by deadline, status, tags, assignee
- Color coding for lists/folders
- Archive tasks/lists
- Drag-and-drop sorting
- Quick global task creation

### Shopping List
- Dedicated list type for shopping
- Auto-complete for groceries and household items
- Automatic categorization
- Mark items as purchased without deleting

### Additional Features
- **Real-time updates** for all users
- **Offline mode** with automatic sync
- **Push notifications** for deadlines/changes
- **Calendar view** for tasks with deadlines
- **Global search** across all lists/tasks
- **Activity history** tracking
- **Profile avatars** via Supabase Storage
- **Data export** to JSON/CSV
- **Theme switching** (light/dark)

## User Stories

Key user stories from PRD (see famtodo_prd.md for complete list):
1. Admin creates families with separate data
2. Admin assigns roles to control access
3. Persistent login sessions
4. Private/family/adult list creation
5. Folder organization
6. Full task management with all fields
7. Smart shopping list with categorization
8. Real-time collaboration
9. Offline functionality
10. Calendar integration
11. Search capabilities
12. Activity tracking
13. Data backup/export

## Security

- JWT authentication for all API calls
- RLS ensures users only access their family's data
- Adult-only content restricted by role check
- No secrets in code - use environment variables

## Deployment Process

1. Local development with Docker Compose
2. Commit/push to main branch
3. CI/CD via Dokploy
4. Production uses separate `.env` values

## Important Notes

- All API calls require JWT in `Authorization: Bearer <token>` header
- The app is designed as a PWA with offline support planned
- Primary platform is mobile - ensure responsive design
- Use minimalist UI patterns with shadcn/ui components
- Never commit secrets - use environment variables
- Commit and push after every completed task