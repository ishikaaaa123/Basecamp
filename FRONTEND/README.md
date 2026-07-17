# Frontend setup

This frontend reads its API address from the required `VITE_API_BASE_URL`
environment variable.

1. Copy this folder into the destination project.
2. Run `npm install` in this folder.
3. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the backend API
   base URL. Keep `/api/v1` only if the backend uses that prefix.
4. Run `npm run dev`.

The backend must allow the frontend's deployed origin through `CORS_ORIGIN`.
All frontend API calls should import and use `api` from `src/lib/api.ts`.

This is a standard Vite + React frontend. It has no Lovable runtime, plugin,
or telemetry dependency.
