# LIGENIA Backend Scripts

This directory contains utility scripts for the LIGENIA backend application.

## Test Data Generation Scripts

### Creating Admin User in Supabase

The `create-admin-user.ts` script creates an admin user in Supabase and synchronizes it with the local database.

```bash
# Run using NPM script
npm run admin:create

# Or run directly
ts-node scripts/create-admin-user.ts
```

This script will:
1. Prompt you for an email, password, and name for the admin user
2. Create this user in Supabase Auth with `ADMIN` role
3. Synchronize the user to your local database
4. Optionally create a player profile for this admin

### Generating Test Data

The `generate-test-data.ts` script generates comprehensive test data for the database, including players, tournaments, matches, and statistics.

```bash
# Run using NPM script
npm run testdata:generate

# Or run directly
ts-node scripts/generate-test-data.ts
```

This script will:
1. Ask for an admin user ID from Supabase (you should create one using the `admin:create` script first)
2. Create multiple test players with different skill levels
3. Generate past, active, and future tournaments
4. Create matches for tournaments
5. Generate statistics for tournament participants
6. Add user preferences and performance history

## Synchronizing Supabase Users

The `sync-supabase-users.ts` script synchronizes users from Supabase Auth to the local database.

```bash
# Run using NPM script
npm run sync:supabase:users

# Or run directly
ts-node scripts/sync-supabase-users.ts
```

This script will:
1. Fetch all users from Supabase Auth
2. For each user not in the local database, create a corresponding user record
3. Skip users that already exist in the local database

## Notes

- For these scripts to work properly, you need valid Supabase credentials in your `.env` file:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ANON_KEY`
- The database connection settings must also be correctly configured in your `.env` file.
- Make sure your Prisma schema is up to date before running these scripts.

## Usage Example

The recommended workflow is:

1. Create an admin user: `npm run admin:create`
2. Note the admin user ID from the console output
3. Generate test data: `npm run testdata:generate`
4. When prompted, enter the admin user ID from step 2

This will set up your database with all necessary test data for API testing. 