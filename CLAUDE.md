# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the project

**Frontend** (Next.js 14, port 3000):
```bash
cd aerosepct   # repo root
npm run dev
```

**Backend** (FastAPI, port 8000):
```bash
cd aerosepct/backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Database migrations** (Alembic):
```bash
cd aerosepct/backend && source venv/bin/activate
alembic revision --autogenerate -m "describe_change"
alembic upgrade head
```

**Lint** (frontend):
```bash
npm run lint
```

**Build** (frontend):
```bash
npm run build
```

Both services must be running simultaneously. The frontend proxies all API calls to `http://localhost:8000`.

## Architecture

This is a full-stack UAV aircraft inspection platform with two separate processes:

### Frontend — Next.js 14 (`aerosepct/` root)
- **App Router** with a `(dashboard)` route group for all authenticated pages. Layout at `app/(dashboard)/layout.tsx` wraps every dashboard page with `Sidebar` + `Topbar`.
- **Auth flow**: Login page posts to `/api/auth/login` (Next.js route), which calls FastAPI, then sets two cookies:
  - `auth_token` — httpOnly JWT, used server-side only
  - `auth_user` — non-httpOnly JSON blob, readable via `useAuth()` hook in client components
- **Middleware** (`middleware.ts`): Guards all dashboard routes by verifying `auth_token` with `jose`. Redirects to `/login` if invalid.
- **API calls** from client pages use `apiFetch<T>()` in `lib/api.ts`, which hits `/api/backend/{path}`. That Next.js route (`app/api/backend/[...path]/route.ts`) reads the httpOnly `auth_token` cookie server-side and forwards it as `Authorization: Bearer` to FastAPI. This is the only way client components can authenticate with the backend.
- **3D viewer**: `components/ModelViewer3D.tsx` uses `@react-three/fiber` + `@react-three/drei`. GLB files are served by FastAPI at `http://localhost:8000/static/meshes/{id}.glb`. The inspection detail page prefixes `mesh_url` from the API response with `http://localhost:8000` to build the full URL.
- **Snake_case ↔ camelCase**: Backend returns snake_case; each page defines its own inline interface with snake_case fields. No global transform. `lib/types.ts` uses camelCase for the shared type definitions.
- **UI components** in `components/ui/` are Radix UI primitives styled with Tailwind (shadcn/ui pattern).

### Backend — FastAPI (`aerosepct/backend/`)
- **Entry**: `main.py` — registers routers, CORS (localhost:3000 only), mounts `/static` for GLB files, and handles `/auth/login`, `/auth/me`, `/auth/logout` directly (hardcoded admin user only; DB users are separate).
- **Database**: PostgreSQL via SQLAlchemy ORM. `database.py` reads `DATABASE_URL` from `.env`. `models.py` defines all tables. `deps.py` provides `get_current_user` (JWT decode) and `get_db` (session factory) as FastAPI dependencies.
- **Routers**: One file per resource in `routers/` — `aircraft`, `missions`, `inspections`, `defects`, `reports`, `users`, `analytics`, `processing`.
- **Processing pipeline** (`routers/processing.py`): Upload endpoint accepts a `.zip` or `.tar` file, spawns a background thread that uploads to MEGA cloud storage, polls for the AI pipeline to produce `output.glb`, downloads it to `static/meshes/{inspection_id}.glb`, creates an `Inspection` record, and adds placeholder defects.
- **PDF export**: `routers/reports.py` has `GET /reports/{id}/pdf` which builds a PDF with `reportlab` and streams it back.
- **JWT**: PyJWT in `deps.py`. Same secret as `jose` in `middleware.ts` — they must stay in sync.

### Data model (key relationships)
```
Aircraft ──< Mission ──< Inspection ──< Defect
                    └──< ProcessingJob
Inspection ──< Report
```

### File upload → 3D model flow
1. Frontend posts frames ZIP to `POST /processing/upload/{mission_id}`
2. Backend uploads to MEGA `/uploads/frames.zip`
3. External AI pipeline processes it and puts `output.glb` in MEGA `/outputs/`
4. Backend polls MEGA, downloads GLB to `static/meshes/{inspection_id}.glb`
5. Creates `Inspection` with `mesh_url = /static/meshes/{id}.glb`
6. Frontend inspection detail page reads `mesh_url`, prefixes with `http://localhost:8000`, passes to `ModelViewer3D`

## Key config files
- `aerosepct/backend/.env` — `DATABASE_URL`, `JWT_SECRET`, `MEGA_EMAIL`, `MEGA_PASSWORD`
- `aerosepct/.env.local` — frontend env vars (currently `NEXT_PUBLIC_API_URL` if needed)
- `aerosepct/users.json` — legacy file, not used by current auth (backend uses hardcoded admin)
