# Railway Deployment Guide

This document provides step-by-step instructions for deploying the Ligenia backend to Railway.

## Prerequisites

1. A Railway account (https://railway.app/)
2. The Railway CLI installed locally: `npm install -g @railway/cli`
3. A GitHub account for CI/CD integration (optional)

## Setup Steps

### 1. Create a New Project in Railway

1. Log in to your Railway dashboard
2. Click "New Project" and select "Deploy from GitHub repo"
3. Connect your GitHub account if not already connected
4. Select the repository containing the Ligenia backend
5. Choose the main branch for deployment

### 2. Add a PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Wait for the database to be provisioned
4. Once created, go to the "Connect" tab to find your connection details

### 3. Configure Environment Variables

Set the following variables in your Railway project:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=<your-railway-postgres-url>
JWT_SECRET=<strong-random-value>
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
OPENAI_API_KEY=<your-openai-api-key>
LOG_LEVEL=info
LOG_FORMAT=json
LOG_REDACT_SENSITIVE=true
LOG_TO_FILE=true
LOG_ROTATION=true
LOG_RETENTION_DAYS=7
LOG_MAX_SIZE=10
FRONTEND_URL=<your-frontend-url>
```

### 4. Set Up Database Migrations

Railway will automatically run your application's build and start commands. To include database migrations:

1. Make sure the `railway-migration.js` script exists in the `scripts` directory
2. Add a "Railway Start Command" in your project settings:
   ```
   node scripts/railway-migration.js && npm start
   ```

### 5. Configure GitHub Actions (Optional)

To use GitHub Actions for CI/CD:

1. Generate a Railway API token from your Railway account settings
2. Add the token as a GitHub secret named `RAILWAY_TOKEN` in your repository settings
3. Make sure the `.github/workflows/railway-deploy.yml` file exists in your repository

### 6. Manual Deployment (Alternative to GitHub Actions)

If not using GitHub Actions, you can deploy manually:

1. Login to Railway CLI: `railway login`
2. Link to your project: `railway link`
3. Deploy your application: `railway up`

## Staging Environment

For testing before production:

1. Create a separate Railway project for staging
2. Configure the same environment variables but with staging values
3. In the staging environment, set `RAILWAY_ENVIRONMENT=staging` to enable seed data

## Monitoring and Logs

1. Railway provides logs for your deployment - access them from the project dashboard
2. The `/api/health` endpoint can be used to check application status
3. For more detailed monitoring, consider adding a monitoring service like New Relic or Sentry

## Troubleshooting

Common issues and solutions:

- **Database connection errors**: Verify the DATABASE_URL is correctly set
- **Migration failures**: Check the Railway logs for specific error messages
- **Build failures**: Ensure all dependencies are properly defined in package.json
- **Memory issues**: Adjust the memory allocation in your Railway configuration if needed

## Rollback Process

If a deployment causes issues:

1. In the Railway dashboard, go to "Deployments"
2. Find the last known good deployment
3. Click "Rollback to this deployment"

For more advanced Railway configuration options, refer to the [Railway documentation](https://docs.railway.app/). 