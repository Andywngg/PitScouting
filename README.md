# Team 1334 Pit Scouting (2026)

Pit scouting app for FRC events with:

- React frontend (`frontend`)
- Express + TypeScript backend (`backend`)
- PostgreSQL (Sequelize)
- Optional Cloudinary image storage for persistent robot photos

## 1. Local Setup

1. Install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

2. Create env files:

- `backend/.env` from `backend/.env.example`
- `frontend/.env` from `frontend/.env.example`

3. Run DB migrations:

```bash
cd backend
npm run migrate
```

4. Start dev servers from repo root:

```bash
npm run dev
```

Frontend default: `http://localhost:3000`  
Backend default: `http://localhost:5001`

## 2. Full Free Deployment (Recommended)

Use this stack:

- Database: Neon Postgres (free)
- Backend API: Render Web Service (free instance)
- Frontend: Vercel Hobby
- Images: Cloudinary free (recommended so images persist)

### Step A: Database (Neon)

1. Create a Neon project and DB.
2. Copy your pooled Postgres connection string (`DATABASE_URL`).

### Step B: Backend (Render)

This repo includes `render.yaml` for backend deploy.

1. Push this repo to GitHub.
2. In Render, create from Blueprint and select this repo.
3. Fill required env values when prompted:
   - `DATABASE_URL` = Neon connection string
   - `FRONTEND_URL` = your Vercel URL (later you can update it)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` (optional bootstrap admin login)
   - `CLOUDINARY_*` values (recommended for persistent uploads)
4. Deploy.

`render.yaml` automatically does:

- Build: `npm install && npm run build`
- Pre-deploy migrations: `npm run migrate`
- Start: `npm start`

### Step C: Frontend (Vercel)

1. Import the same GitHub repo in Vercel.
2. Set **Root Directory** to `frontend`.
3. Add env var:

```env
REACT_APP_API_URL=https://your-render-backend.onrender.com/api
```

4. Deploy.

`frontend/vercel.json` is included so React Router paths (like `/dashboard`) resolve correctly.

### Step D: Final Wiring

After Vercel deploy gives your final URL:

1. Update Render `FRONTEND_URL` to the exact Vercel domain.
2. Redeploy backend once.

## 3. Security Checklist

- Set a strong `JWT_SECRET` (auto-generated in `render.yaml`).
- Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` if you want bootstrap admin login.
- Remove any old hardcoded credentials from your private notes.
- Rotate any credentials that were previously exposed.

## 4. Verify Deployment

1. Open frontend URL.
2. Register/login.
3. Submit one scouting entry with image.
4. Confirm it appears in dashboard and detail page.
5. Export CSV from dashboard.

## 5. Useful Commands

Run backend migration manually:

```bash
cd backend
npm run migrate
```

Create/update admin user in DB from env vars:

```bash
cd backend
node scripts/createAdmin.js
```
