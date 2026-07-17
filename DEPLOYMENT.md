# Deployment guide

Deploy the three parts in this order: MongoDB Atlas, the Express API, then the
Vite frontend. Replace the example domains below with your own.

## 1. Prepare MongoDB Atlas

1. Create an Atlas project and database deployment.
2. Create a database user with a strong password.
3. In Network Access, allow the IP ranges required by your backend host.
4. Copy the application's connection string and use it as `MONGO_URL`.

## 2. Deploy the backend

Create a Node web service from this repository with:

- Root directory: `backend`
- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/api/v1/healthcheck`

Set these environment variables in the hosting provider. Do not commit them to
Git.

```env
MONGO_URL=mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority
ACCESS_TOKEN_SECRET=<long-random-secret>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<different-long-random-secret>
REFRESH_TOKEN_EXPIRY=10d
CORS_ORIGIN=https://app.your-domain.example
BACKEND_PUBLIC_URL=https://api.your-domain.example
```

After deployment, open `https://api.your-domain.example/api/v1/healthcheck`.
It must return a successful response before deploying the frontend.

## 3. Deploy the frontend

Create a static-site deployment from the same repository with:

- Root directory: `FRONTEND`
- Build command: `npm ci && npm run build`
- Publish directory: `dist`

Add this build-time environment variable:

```env
VITE_API_BASE_URL=https://api.your-domain.example/api/v1
```

Deploy it, then add the resulting frontend URL to the backend's `CORS_ORIGIN`
and redeploy the backend. If you use a custom frontend domain, repeat this
update with the final domain.

## 4. Verify the live app

1. Register a new account, then log in and create a project.
2. Perform a task update and upload a file, confirming its link uses the API domain.
3. Refresh a nested route such as `/dashboard` and a project URL. Configure an
   SPA fallback to `index.html` if the frontend host does not provide one.

## Important production note

Task attachments currently use the backend's local `public/images` directory.
Many hosts use ephemeral filesystems, which means uploads can disappear after a
restart or redeploy. Use a persistent disk or move uploads to object storage
(for example S3 or Cloudinary) before relying on attachments in production.
