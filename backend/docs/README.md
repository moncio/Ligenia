# Documentation

This directory contains documentation for the Ligenia backend project.

## Directory Structure

- **`api/`**: API documentation
  - `api-structure-checklist.md`: Checklist for API structure design
  - `controller-checklist.md`: Implementation checklist for API controllers
  - **`endpoints/`**: Documentation for specific API endpoints
    - `api-testing-checklist.md`: Comprehensive testing checklist for all API endpoints

- **`architecture/`**: System architecture documentation
  - `core-checklist.md`: Implementation checklist for core components

- **`database/`**: Database documentation
  - Schema diagrams
  - Entity relationships
  - Migration information

- **`deployment/`**: Contains deployment-related documentation
  - `railway-guide.md`: Instructions for deploying the application to Railway
  - `test-plan.md`: Test plan for verifying deployments

- **`development/`**: Contains development-related documentation
  - `logging-system.md`: Documentation for the logging system
  - `logging-migration-example.md`: Examples of migrating to the new logging system

- **`guides/`**: Practical guides for common tasks
  - `supabase-setup.md`: Guide for setting up Supabase authentication

- **`project/`**: Project management documentation
  - `final-backend-checklist.md`: Tracking document for backend completion status

- **`testing/`**: Contains testing-related documentation
  - `authentication-testing.md`: Guide for testing authentication features
  - `test-improvements.md`: Notes on testing improvements
  - **`coverage/`**: Test coverage documentation
    - `notes.md`: Notes about test coverage, improvements, and future plans

## MVP Integration and Deployment

For the integration between the backend and frontend, and final deployment to Railway, refer to the root-level document:

- `MVP_INTEGRATION_CHECKLIST.md`: Comprehensive checklist for integrating backend with frontend and deploying to production

## About Documentation

The documentation in this directory is intended for developers and maintainers of the Ligenia backend. It covers various aspects of the project, from technical details to operational procedures.

### Documentation Guidelines

1. Keep documentation up-to-date when making significant changes
2. Use Markdown format for all documentation
3. Include examples where appropriate
4. Separate concerns by using the appropriate subdirectory

## Contributing to Documentation

When adding new documentation:

1. Choose the appropriate subdirectory (or create a new one if needed)
2. Use clear filenames that indicate the content
3. Follow the existing Markdown formatting style
4. Update this README.md if you add a new category or important document 