# Deployment Runbook

This runbook covers staging and production deployment for Slotify using:
- Frontend: Vercel
- Backend: Render or Railway
- Database: MongoDB Atlas

## 1. Environments

Use these templates to provision variables in your hosting platforms:
- backend/.env.staging.example
- backend/.env.production.example
- frontend/.env.staging.example
- frontend/.env.production.example

Do not commit real secrets.

Generate a strong JWT secret before first deploy:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Required runtime behavior to account for:
- Backend fails startup in production if `CORS_ORIGINS` is empty.
- Frontend should set explicit `VITE_API_BASE_URL` in hosted deployments.

## 2. Pre-Deploy Preflight (Local)

Run these before promoting any release:

```bash
cd backend
npm ci
npm run verify:deploy-env
npm test
```

```bash
cd frontend
npm ci
VITE_API_BASE_URL=https://api.example.com/api VITE_GOOGLE_CLIENT_ID=placeholder npm run verify:deploy-env
npm run lint
npm run build
```

Use real values for environment variables in staging/production hosts.

## 3. GitHub Repository Settings

Configure these repository variables in GitHub Actions:
- STAGING_BACKEND_URL
- STAGING_FRONTEND_URL

Examples:
- STAGING_BACKEND_URL=https://slotify-api-staging.onrender.com
- STAGING_FRONTEND_URL=https://slotify-staging.vercel.app

## 4. Platform Configuration

### Frontend (Vercel)
Use these settings if you are deploying the `frontend` directory as a project:
- Root Directory: `frontend`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`
- Node.js Version: `20.x`

Routing fallback for SPA deep links is configured in `frontend/vercel.json`.

### Backend (Render or Railway)
- Start command: `npm run start:prod`
- Health check path: `/api/health`
- Readiness path for manual checks: `/api/ready`
- Node.js Version: `20.x`

## 5. Staging Deployment Checklist

1. Deploy backend staging service and verify logs show successful database connection.
2. Deploy frontend staging project and ensure VITE_API_BASE_URL points to staging backend.
3. Run smoke checks:
   - GET /api/health should return 200.
   - GET /api/ready should return 200.
   - Frontend deep-link route should return HTTP 200.
4. Run key user flows manually:
   - Login
   - Vendor listing
   - Vendor dashboard
   - Booking path

## 6. First Production Bootstrap

1. Complete staging checklist and promote both services.
2. Create or identify the first production user account.
3. Run admin bootstrap command on production backend environment:

```bash
npm run promote:admin -- user@example.com
```

4. Verify admin can access `/dashboard/admin` in frontend.

## 7. Production Promotion Checklist

1. Confirm staging smoke checks are green.
2. Confirm no unresolved incidents from the latest staging run.
3. Promote backend release to production.
4. Promote frontend release to production.
5. Re-run smoke checks against production URLs.
6. Verify auth, vendor listing, and booking workflow manually.

## 8. Rollback Procedure

### Frontend rollback (Vercel)
1. Open Vercel project deployments.
2. Promote the previous successful deployment to production.
3. Confirm route and API connectivity via smoke checks.

### Backend rollback (Render)
1. Open Render service.
2. Roll back to previous successful deploy.
3. Verify /api/health and /api/ready return 200.

### Backend rollback (Railway)
1. Open Railway service deploy history.
2. Redeploy the last known-good release.
3. Verify /api/health and /api/ready return 200.

## 9. Incident Notes

Record each deployment event with:
- Commit SHA
- Deployment start/end time
- Outcome (success/fail)
- Rollback required (yes/no)
- Owner
