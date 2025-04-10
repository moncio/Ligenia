# Ligenia Backend – Prompt History (Cursor using Sonnet 3.5 and 3.7)

This document captures 10 realistic prompts used during the development of the Ligenia backend, built with Node, TypeScript, Prisma, Supabase, and Railway, following clean hexagonal architecture and TDD principles. Of course there were a lot of iterations with the LLM model to get the final result.

---

## Prompt 1:
Start a backend for a tournament management system called Ligenia using TypeScript and Node. Use hexagonal architecture from the beginning and separate the domain, application, and infrastructure layers clearly. Add core entities like User, Player, Match, and Tournament.

---

## Prompt 2:
Set up Zod for input validation and create a base Result class to standardize success/error returns across all use cases. Use this pattern consistently across all core logic. Ensure each use case returns a typed result.

---

## Prompt 3:
Implement the `CreateTournamentUseCase` and `ListTournamentsUseCase`, with filtering by status and category. Use dependency injection and write unit tests using mocks. Follow TDD and keep core business logic decoupled from infrastructure.

---

## Prompt 4:
Create the `GenerateTournamentBracketUseCase` for single elimination format. Make sure it integrates with `StartTournamentUseCase`, auto-generates first-round matches, and is covered by unit tests. Handle edge cases like odd numbers of participants and minimum player limits.

---

## Prompt 5:
Write integration tests for `TournamentRepository` using Prisma and a test PostgreSQL database. Validate CRUD operations, filtering, and pagination. Use test containers or isolated test environments for consistency.

---

## Prompt 6:
Connect all Tournament API routes to their respective use cases using InversifyJS for dependency injection. Apply authentication middleware using Supabase Auth. Write integration tests for each route, mocking auth sessions where needed.

---

## Prompt 7:
Implement core use cases for Player: create player profile, update profile, list players with filtering, retrieve player matches, and get tournaments played. Use TDD and clean separation between application and infrastructure layers.

---

## Prompt 8:
Fix failing integration tests caused by foreign key violations and schema mismatches. Create a shared test utility to manage DB setup/teardown. Ensure data dependencies (users > players > matches) are respected and isolated between test runs.

---

## Prompt 9:
Create a `/api/health` endpoint that returns server uptime, memory usage, and database connectivity status. Document it using Swagger/OpenAPI. Mark all Supabase-auth delegated routes with ⚡️ in the Swagger UI.

---

## Prompt 10:
Prepare backend for Railway deployment: create Dockerfile with multi-stage build (builder and production stages), add `.dockerignore`, configure `.env.production`, automate Prisma migrations on deploy, and create a GitHub Actions workflow to deploy on push to `main`.

---
