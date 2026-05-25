Deployment Guide
================

This project is a `pnpm` monorepo with:

- Frontend: `artifacts/leafline` (Vite + React)
- API: `artifacts/api-server` (Express)
- Database: PostgreSQL via Drizzle

This file is written for beginners and matches the current working setup of this repo.

What I Recommend
----------------

If you want the cheapest possible deployment:

1. Frontend: `Cloudflare Pages` (free)
2. API: `Render Web Service` free tier
3. Database: `Supabase Postgres` free tier

Why this stack:

- `Cloudflare Pages` is excellent for static Vite apps and keeps the frontend live continuously.
- `Render` can run the Node API for free, but it sleeps after inactivity.
- `Supabase` gives you a real free Postgres database.

Important free-tier tradeoffs:

- `Cloudflare Pages`: best part of the stack, static frontend stays live.
- `Render free API`: sleeps after 15 minutes of no traffic and may take around a minute to wake up again.
- `Supabase free DB`: free projects are paused after 1 week of inactivity.

If you want a smoother demo later, the first paid upgrade should be the API host.

Before You Start
----------------

1. Install Node `20.20.1` or Node `22`.
2. Install `pnpm` version `10`.
3. Create accounts on:
   - GitHub
   - Cloudflare
   - Render
   - Supabase
4. Push this repo to GitHub.

Node version note
-----------------

This repo now includes `.nvmrc` and expects:

- Node: `20.20.1`
- pnpm: `10.x`

If you use `nvm`, run:

```bash
nvm use
```

If you do not use `nvm`, make sure your deployment platform is configured to use Node `20` or `22`.

Local Checks
------------

Run these before deploying:

```bash
pnpm install
pnpm --filter @workspace/leafline run typecheck
pnpm --filter @workspace/leafline run build
pnpm --filter @workspace/api-server run build
```

Frontend output directory:

- `artifacts/leafline/dist/public`

This is important because many hosts will ask for the publish/output folder.

Environment Variables
---------------------

Frontend:

- `VITE_API_BASE_URL`

API:

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `AI_INTEGRATIONS_OPENAI_API_KEY`
- `AI_INTEGRATIONS_OPENAI_BASE_URL`

Optional API variables:

- `AI_INTEGRATIONS_OPENAI_MODEL`
- `OPENROUTER_API_KEY`
- `OPENROUTER_BASE_URL`
- `OPENROUTER_MODEL`
- `OPENROUTER_SITE_URL`
- `OPENROUTER_APP_NAME`

Step 1: Create the Supabase Database
------------------------------------

1. Go to `https://supabase.com/` and sign in.
2. Create a new project.
3. Choose a project name.
4. Set a database password and save it somewhere safe.
5. Wait for the project to finish provisioning.
6. Open the project dashboard.
7. Go to `Connect`.
8. Copy the `URI` or `DATABASE_URL` style connection string.

You will use that value later as `DATABASE_URL`.

Example format:

```text
postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
```

Step 2: Push Schema and Seed Plants
-----------------------------------

Do this from your computer before deploying:

```bash
DATABASE_URL="your_supabase_database_url" pnpm --filter @workspace/db run push
DATABASE_URL="your_supabase_database_url" pnpm --filter @workspace/scripts run seed:plants
```

What these do:

- `push` creates the tables in your database
- `seed:plants` inserts the plant catalog so the shop is not empty

If `seed:plants` fails locally because of `tsx` sandbox or environment issues, run the same command on your own terminal outside the sandboxed agent session.

Step 3: Deploy the API on Render
--------------------------------

1. Go to `https://render.com/`.
2. Sign in with GitHub.
3. Click `New +`.
4. Choose `Web Service`.
5. Connect your GitHub repo.
6. Select this repository.

Render settings:

- Name: choose something like `leafline-api`
- Root Directory: leave empty
- Runtime: `Node`
- Build Command:

```bash
corepack enable && pnpm install && pnpm --filter @workspace/api-server run build
```

- Start Command:

```bash
pnpm --filter @workspace/api-server run start
```

- Instance Type: `Free`

Environment variables on Render:

- `NODE_VERSION` = `20.20.1`
- `PORT` = `3000`
- `DATABASE_URL` = your Supabase connection string
- `JWT_SECRET` = any long random secret
- `AI_INTEGRATIONS_OPENAI_API_KEY` = your OpenAI key
- `AI_INTEGRATIONS_OPENAI_BASE_URL` = usually `https://api.openai.com/v1`

Recommended extra variable:

- `AI_INTEGRATIONS_OPENAI_MODEL` = model you actually use

After deployment:

1. Open the Render service.
2. Wait for `Live`.
3. Copy the public URL.

It will look like:

```text
https://leafline-api.onrender.com
```

Test the API in a browser:

```text
https://your-render-url.onrender.com/api/health
```

If the API is sleeping, wait for it to wake up.

Step 4: Deploy the Frontend on Cloudflare Pages
-----------------------------------------------

1. Go to `https://dash.cloudflare.com/`.
2. Open `Workers & Pages`.
3. Click `Create application`.
4. Choose `Pages`.
5. Choose `Import an existing Git repository`.
6. Connect GitHub and select your repo.

Use these settings:

- Framework preset: `Vite`
- Root directory: `artifacts/leafline`
- Build command:

```bash
corepack enable && pnpm run build
```

- Build output directory:

```text
dist/public
```

- Environment variable:

```text
VITE_API_BASE_URL=https://your-render-url.onrender.com
```

Optional build environment variable:

```text
NODE_VERSION=20
```

After deploy, Cloudflare will give you a URL like:

```text
https://your-project-name.pages.dev
```

Step 5: Test the Live App
-------------------------

Check these things:

1. Home page loads
2. Shop page loads plants
3. Plant details open
4. Auth page works
5. Donation page loads
6. AI assistant can reach the backend

If the frontend loads but data is missing:

- confirm `VITE_API_BASE_URL` is correct
- confirm the Render API is running
- confirm the database has been seeded

Very Common Problems
--------------------

1. Frontend loads, but no plants appear

Cause:

- API URL is wrong
- database has no seeded plants

Fix:

- check `VITE_API_BASE_URL`
- run:

```bash
DATABASE_URL="your_db_url" pnpm --filter @workspace/scripts run seed:plants
```

2. API deploys, but crashes immediately

Cause:

- missing `DATABASE_URL`
- missing `PORT`
- invalid OpenAI environment variables

Fix:

- open Render environment settings and recheck all values

3. Login or protected routes fail

Cause:

- `JWT_SECRET` missing or changed unexpectedly

Fix:

- set one stable `JWT_SECRET` and redeploy the API

4. First request is very slow

Cause:

- Render free tier cold start

Fix:

- this is normal on the free plan
- open the site 2 to 5 minutes before your presentation
- click around once to warm the API

5. Supabase database appears paused

Cause:

- free project inactivity

Fix:

- open Supabase dashboard before the demo
- wait for the database to resume
- then warm the API again

Presentation Advice for Free Hosting
------------------------------------

If you are presenting to panel members:

1. Open the frontend URL 5 to 10 minutes before your demo.
2. Visit the shop page once.
3. Visit one protected/backend page once.
4. If you use AI features, test one prompt before the presentation begins.

This avoids cold-start surprises.

Recommended Order of Deployment
-------------------------------

1. Supabase database
2. Schema push
3. Seed plants
4. Render API
5. Cloudflare Pages frontend
6. End-to-end testing

Exact Commands Summary
----------------------

Install:

```bash
pnpm install
```

Database push:

```bash
DATABASE_URL="your_db_url" pnpm --filter @workspace/db run push
```

Seed plants:

```bash
DATABASE_URL="your_db_url" pnpm --filter @workspace/scripts run seed:plants
```

Frontend local build:

```bash
pnpm --filter @workspace/leafline run build
```

API local build:

```bash
pnpm --filter @workspace/api-server run build
```

If You Want a Better Non-Free Upgrade Later
-------------------------------------------

Best next upgrade:

- keep `Cloudflare Pages` for frontend
- move API to `Railway Hobby`
- keep DB on `Supabase` or move it to `Railway Postgres`

That gives a much better always-on experience than fully free hosting.

Files That Matter for Deployment
--------------------------------

- Frontend package: `artifacts/leafline/package.json`
- Frontend Vite config: `artifacts/leafline/vite.config.ts`
- Frontend HTML entry: `artifacts/leafline/index.html`
- API package: `artifacts/api-server/package.json`
- API server entry: `artifacts/api-server/src/index.ts`
- API env loader: `artifacts/api-server/src/loadEnv.ts`
- DB package: `lib/db/package.json`
- Seed script: `scripts/src/seed-plants.ts`

Current Status
--------------

The frontend production build now succeeds locally and outputs to:

```text
artifacts/leafline/dist/public
```

The API build also succeeds locally.
