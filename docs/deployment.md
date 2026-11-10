# Deploy TravelAI

Use Vercel for `Frontend`, Render for `Backend`, and MongoDB Atlas for cloud data. RAG stays disabled for this demo deployment. No Ollama, Chroma disk, real payment gateway or reservation account is needed.

## 1. Prepare MongoDB Atlas

1. Create a free Atlas cluster, preferably near Singapore to match the backend region.
2. Create a database user with read/write access to the `travel_ai` database. This is separate from your Atlas account login.
3. Copy the Atlas **Drivers / Python** connection string and substitute the database user's password as instructed by Atlas. Keep it private.
4. In Atlas Network Access, allow the outbound IP ranges shown on your Render service's Connect page. Add those ranges before starting the backend. Avoid opening access to every address.

Set this URI directly as `MONGODB_URI` in Render. A localhost URI cannot connect to the database on your laptop from Render. A new Atlas database starts empty: local accounts, trips and bookings are not automatically uploaded. Register a new account online unless you separately choose to migrate your data.

## 2. Configure the frontend project first

In Vercel, import **your** `srivanimarelli-ctrl/TravelAI` repository, using `main` and root directory **Frontend**. Select Vite and Node.js **22.x**. The committed `Frontend/vercel.json` configures the build and `dist` output.

Reserve/record the project's production domain. Then set up the backend using that exact origin for CORS. Do not publish until the backend URL is configured: `build:deploy` intentionally rejects missing or localhost API URLs. No secrets belong in `VITE_*` variables because these are public browser settings.

## 3. Deploy the backend

In Render, create a **Blueprint** from the same repository and branch, using the root `render.yaml`. Review the free service plan before creating it. It configures Python 3.10.11, the core requirements, one Uvicorn worker, and `/health/ready`.

Enter the prompted values in Render:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Private Atlas connection string |
| `GROQ_API_KEY` | Your existing valid Groq key |
| `GROQ_MODEL` | A model enabled for your Groq account; copy your working local setting |
| `CORS_ORIGINS` | Exact frontend origin, e.g. `https://your-project.vercel.app`, without a trailing slash |

`RAG_ENABLED=false` and `MONGODB_DB_NAME=travel_ai` are supplied by the Blueprint. Optionally add `SERPAPI_API_KEY` in Render for live discovery; live results require remaining provider credits. Sample demo bookings remain separate from live results.

For manual service creation, use:

```text
Root directory: Backend
Build: python -m pip install -r requirements.txt
Start: python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1
Health check: /health/ready
Python version: PYTHON_VERSION=3.10.11
```

Keep a single instance/worker: demo routing request limits and planning coordination currently run within the process. Do not add `--reload`. No disk is required when RAG is disabled; application data goes to Atlas.

Open `https://YOUR-BACKEND.onrender.com/health/ready` and confirm `status: ok`. If deployment fails, inspect Render logs and verify Atlas Network Access, database-user credentials and environment variable names. Never paste keys or database URIs into shared logs or screenshots.

## 4. Connect and deploy the frontend

Set **Vercel → Project → Settings → Environment Variables → Production**:

```text
VITE_FASTAPI_URL=https://YOUR-BACKEND.onrender.com
```

Deploy/redeploy `main`. Vite reads this variable at build time, so changing it requires another deployment. Add a preview origin to `CORS_ORIGINS` only if you intend to test that specific preview. Avoid wildcard origins.

If an existing browser has an API Settings override, reset it or select the hosted backend: that saved setting takes precedence over the build URL. A fresh/incognito browser uses the configured production URL.

## 5. Verify the hosted application

- Check readiness and confirm the frontend reports Connected.
- Register a test account, sign out and sign back in.
- Generate a short itinerary and inspect planning progress, maps and available travel results.
- Complete a clearly labelled sample demo booking; check history, confirmation and Companion access after refresh.
- Check mobile layout and a second browser session. Confirm records survive a backend restart.
- Check the browser Network panel for CORS errors and accidental localhost requests.

Free Render services can sleep after inactivity and have limited memory. Expect cold starts; this is a college/demo setup, not an uptime guarantee. Planning interrupted by a restart may require recovery/retry. Upgrade only after reviewing cost and usage requirements. See [Render free-service limits](https://render.com/docs/free).

## Updates and rollback

Push tested changes to your repository's `main`. The Blueprint waits for GitHub checks before automatic backend deployments. Vercel's Git integration manages frontend deployments; verify its build status as well as CI. Keep frontend and backend changes backward compatible, and deploy backend API changes first. Roll back each host to its previous successful deployment if needed; rolling back code does not roll back database contents.

References: [Render FastAPI](https://render.com/docs/deploy-fastapi), [Blueprint configuration](https://render.com/docs/blueprint-spec), [Vercel Vite](https://vercel.com/docs/frameworks/frontend/vite), [Atlas connection setup](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/).
