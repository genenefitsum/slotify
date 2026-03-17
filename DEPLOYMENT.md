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

## 2. GitHub Repository Settings

Configure these repository variables in GitHub Actions:
- STAGING_BACKEND_URL
- STAGING_FRONTEND_URL

Examples:
- STAGING_BACKEND_URL=https://slotify-api-staging.onrender.com
- STAGING_FRONTEND_URL=https://slotify-staging.vercel.app

## 3. Staging Deployment Checklist

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

## 4. Production Promotion Checklist

1. Confirm staging smoke checks are green.
2. Confirm no unresolved incidents from the latest staging run.
3. Promote backend release to production.
4. Promote frontend release to production.
5. Re-run smoke checks against production URLs.
6. Verify auth, vendor listing, and booking workflow manually.

## 5. Rollback Procedure

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

## 6. Incident Notes

Record each deployment event with:
- Commit SHA
- Deployment start/end time
- Outcome (success/fail)
- Rollback required (yes/no)
- Owner
