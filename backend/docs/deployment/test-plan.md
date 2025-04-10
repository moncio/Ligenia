# Railway Deployment Test Plan

This document outlines the procedures for testing the Ligenia backend deployment on Railway before promoting it to production.

## Pre-Deployment Testing

These tests should be run locally before deploying to Railway:

1. **Environment Variables Check**
   - Verify all required environment variables are defined in `.env.production`
   - Confirm that sensitive values are using variable substitution (e.g., `${DATABASE_URL}`)

2. **Docker Build Test**
   - Run `docker build -t ligenia-backend:test .` to test Docker image creation
   - Ensure build completes without errors

3. **Database Migration Scripts**
   - Verify `npx prisma migrate deploy` works in a test environment
   - Test the `railway-migration.js` script locally

## Deployment Verification

After deploying to the Railway staging environment, perform these tests:

### 1. Basic Connectivity

- [ ] **Health Check**: `GET /api/health` returns 200 OK
- [ ] **Swagger Documentation**: Verify Swagger UI is accessible and working

### 2. Authentication & Authorization

- [ ] **User Registration**: Test creating a new user
- [ ] **User Login**: Test login functionality and JWT token issuance
- [ ] **Protected Routes**: Verify authentication is required for protected endpoints

### 3. Core API Functionality

- [ ] **Users API**: Test GET, POST, PUT operations
- [ ] **Tournaments API**: Test tournament creation and retrieval
- [ ] **Matches API**: Test match creation and updates
- [ ] **Preferences API**: Test user preferences storage and retrieval

### 4. Database Operations

- [ ] **Verify Migrations**: Check if all database tables are created correctly
- [ ] **Data Persistence**: Create test data and verify it's stored correctly
- [ ] **Transaction Support**: Test operations requiring transactions

### 5. Error Handling

- [ ] **Invalid Input**: Test API response with invalid input data
- [ ] **Not Found**: Test response for non-existent resources
- [ ] **Unauthorized Access**: Verify correct responses for unauthorized requests
- [ ] **Server Errors**: Verify proper error handling for server-side issues

### 6. Performance Testing

- [ ] **Response Time**: Verify API response times are within acceptable limits
- [ ] **Concurrent Requests**: Test with multiple simultaneous requests
- [ ] **Database Connection**: Check connection pool behavior under load

## Post-Deployment Monitoring

Monitor the following aspects after deployment:

1. **Application Logs**
   - Check for unexpected errors
   - Verify log format and content

2. **Resource Utilization**
   - Monitor CPU and memory usage
   - Check database connection count

3. **Error Rates**
   - Monitor API error rates
   - Track 4xx and 5xx responses

## Rollback Plan

If critical issues are found:

1. Identify the issue through logs and monitoring
2. Document the problem with steps to reproduce
3. Roll back to the previous stable deployment using Railway dashboard
4. Fix the issue locally and verify before redeploying

## Sign-off Criteria

The deployment can be considered successful when:

- [ ] All verification tests pass
- [ ] No critical or high-priority errors in logs
- [ ] API response times meet performance targets
- [ ] Database migrations are applied correctly
- [ ] Swagger documentation is up-to-date and accessible 