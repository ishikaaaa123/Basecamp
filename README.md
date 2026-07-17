# Basecampy

A full-stack project management app (a lightweight "Basecamp clone") with projects, role-based team membership, tasks, subtasks, file attachments, and project notes.

- **Backend:** Node.js, Express 5, MongoDB/Mongoose, JWT auth, Nodemailer
- **Frontend:** React 19, TypeScript, Vite, TanStack Router + Query, Tailwind CSS, shadcn/ui (Radix primitives)

---

## Features

- **Auth:** register/login with JWT access + refresh tokens, email verification, forgot/reset password, change password, resend verification
- **Projects:** create/list/update/delete, with member counts
- **Team membership:** add/remove members, per-project roles
- **Role-based access control:** `admin`, `project_admin`, `member` — see permission matrix below
- **Tasks:** create/update/delete, status tracking (`todo` / `in_progress` / `done`), assignment, file attachments
- **Subtasks:** create/update/delete, completion tracked separately so members can check things off without full task-edit rights
- **Project notes:** admin-authored notes scoped to a project
- **Health check endpoint** for uptime monitoring

## Tech Stack

**Backend** (`/backend`)
| | |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express 5 |
| Database | MongoDB via Mongoose 9 |
| Auth | JSON Web Tokens (`jsonwebtoken`), `bcrypt` for password hashing |
| Validation | `express-validator` |
| Email | `nodemailer` + `mailgen` for templated verification/reset emails |
| Uploads | `multer` |
| Dev tooling | `nodemon`, `prettier` |

**Frontend** (`/FRONTEND`)
| | |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Routing | TanStack Router (file-based, code-generated route tree) |
| Data fetching | TanStack Query + Axios |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix UI primitives) |
| Forms | react-hook-form + zod |
| Misc | framer-motion, recharts, sonner (toasts), lucide-react (icons) |

## Project Structure

```
Basecampy-main/
├── backend/
│   ├── src/
│   │   ├── controllers/      # auth, projects, tasks, notes, healthcheck
│   │   ├── db/                # MongoDB connection
│   │   ├── middleware/        # auth, multer (uploads), request validation
│   │   ├── models/             # User, Project, ProjectMembers, Task, Subtask, ProjectNotes, PendingRegistration
│   │   ├── routes/             # Express routers per resource
│   │   ├── utils/              # ApiError, ApiResponse, asyncHandler, constants, mailgen
│   │   ├── validators/         # express-validator schemas
│   │   ├── app.js              # Express app, middleware, route mounting
│   │   └── index.js            # entrypoint: loads env, connects DB, starts server
│   ├── PRD.md                  # detailed product/API spec
│   └── .env.example
└── FRONTEND/
    └── src/
        ├── routes/              # index, login, register, dashboard, projects.$projectId
        ├── components/          # landing page sections + shadcn/ui component library
        ├── lib/api.ts            # Axios client + typed API functions
        └── hooks/
```

## API Overview

Base path: `/api/v1`

| Resource | Routes |
|---|---|
| **Auth** (`/auth`) | `POST /register`, `POST /login`, `POST /logout`, `GET /current-user`, `POST /change-password`, `POST /refresh-token`, `GET /verify-email/:token`, `POST /forgot-password`, `POST /reset-password/:token`, `POST /resend-email-verification` |
| **Projects** (`/projects`) | `GET /`, `POST /`, `GET /:projectId`, `PUT /:projectId`, `DELETE /:projectId`, `GET /:projectId/members`, `POST /:projectId/members`, `PUT /:projectId/members/:userId`, `DELETE /:projectId/members/:userId` |
| **Tasks** (`/tasks`) | `GET /:projectId`, `POST /:projectId`, `GET /:projectId/t/:taskId`, `PUT /:projectId/t/:taskId`, `DELETE /:projectId/t/:taskId`, `POST /:projectId/t/:taskId/subtasks`, `PUT /:projectId/st/:subTaskId`, `DELETE /:projectId/st/:subTaskId` |
| **Notes** (`/notes`) | `GET /:projectId`, `POST /:projectId`, `GET /:projectId/n/:noteId`, `PUT /:projectId/n/:noteId`, `DELETE /:projectId/n/:noteId` |
| **Health** (`/healthcheck`) | `GET /` |

Full endpoint-by-endpoint spec, request bodies, and status codes live in [`backend/PRD.md`](backend/PRD.md).

### Permission matrix

| Feature | Admin | Project Admin | Member |
|---|:---:|:---:|:---:|
| Create Project | ✓ | ✗ | ✗ |
| Update/Delete Project | ✓ | ✗ | ✗ |
| Manage Project Members | ✓ | ✗ | ✗ |
| Create/Update/Delete Tasks | ✓ | ✓ | ✗ |
| View Tasks | ✓ | ✓ | ✓ |
| Update Subtask Status | ✓ | ✓ | ✓ |
| Create/Delete Subtasks | ✓ | ✓ | ✗ |
| Create/Update/Delete Notes | ✓ | ✗ | ✗ |
| View Notes | ✓ | ✓ | ✓ |

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB instance (local or Atlas)
- An SMTP account for sending verification/reset emails (Gmail App Password works for local dev)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in the values below
npm run dev             # nodemon, hot-reloads on save
```

Environment variables the backend reads (add these to `.env` — not all are in `.env.example`):

```env
PORT=8000
MONGO_URL=mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority

ACCESS_TOKEN_SECRET=change-me
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=change-me-too
REFRESH_TOKEN_EXPIRY=10d

CORS_ORIGIN=https://app.your-domain.example
BACKEND_PUBLIC_URL=https://api.your-domain.example
FORGOT_PASSWORD_REDIRECT_URL=https://app.your-domain.example/reset-password

# SMTP (see backend/.env.example for the Gmail App Password notes)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-project-email@gmail.com
SMTP_PASS=your-16-character-gmail-app-password
MAIL_FROM="Project Camp <your-project-email@gmail.com>"
SMTP_CONNECTION_TIMEOUT_MS=8000
SMTP_GREETING_TIMEOUT_MS=8000
SMTP_SOCKET_TIMEOUT_MS=10000
```

The API will be available at the public URL configured by your hosting provider.

### 2. Frontend

```bash
cd FRONTEND
npm install
cp .env.example .env   # Set VITE_API_BASE_URL to your backend API URL
npm run dev
```

Open the development URL Vite prints.

### Scripts

**Backend**
- `npm run dev` — start with nodemon
- `npm start` — start with node

**Frontend**
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run lint` — ESLint
- `npm run format` — Prettier

## Notes on This Review

A few things worth knowing/fixing before treating this as production-ready:

- **`.env.example` is incomplete.** It's missing `MONGO_URL`, `ACCESS_TOKEN_SECRET`/`EXPIRY`, `REFRESH_TOKEN_SECRET`/`EXPIRY`, `CORS_ORIGIN`, and `FORGOT_PASSWORD_REDIRECT_URL`, all of which the code reads from `process.env`. Anyone cloning the repo will hit silent `undefined` env vars until they cross-reference `app.js`/`PRD.md`. The full list is included above.
- **No automated tests.** There's no test runner, no `*.test.*`/`*.spec.*` files, and no CI config (no `.github/workflows`, no lint/test pipeline).
- **No LICENSE file** — add one if you intend this to be public/open-source.
- The frontend stores the JWT access token in `localStorage` (see `lib/api.ts`), while the backend also sets `cookie-parser`-based cookies — double-check both mechanisms are actually needed, since mixing localStorage tokens with cookie auth widens the XSS attack surface.
- `PRD.md` is a strong asset — it's essentially a full API spec. Keeping it in sync with the code (or generating it from the code, e.g. via an OpenAPI spec) would make onboarding even smoother.

## License

Not currently specified.
