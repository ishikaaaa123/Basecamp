# Frontend setup

This frontend is configured to run at `http://localhost:5174` and send API
requests through Axios to the backend at `http://localhost:8000/api/v1`.

1. Copy this folder into the destination project.
2. Run `npm install` in this folder.
3. Optionally copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the
   backend API base URL. Keep `/api/v1` only if the backend uses that prefix.
4. Run `npm run dev`.

The backend must allow the frontend origin `http://localhost:5174` through
CORS. All frontend API calls should import and use `api` from `src/lib/api.ts`.

This is a standard Vite + React frontend. It has no Lovable runtime, plugin,
or telemetry dependency.
