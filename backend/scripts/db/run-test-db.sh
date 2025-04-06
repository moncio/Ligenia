#!/bin/bash

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
# Change to the backend directory
cd "$SCRIPT_DIR/../../"

echo "🚀 Starting test database from $PWD"

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Extract variables from .env.test file
echo "📋 Loading environment variables..."
export $(grep -v '^#' .env.test | xargs)

# Start container with docker-compose.test.yml
echo "🏗️ Starting database container..."
docker-compose -f docker-compose.test.yml up -d

echo "✅ Test database started"
echo "🔧 User: $DATABASE_USER"
echo "🔧 Database: $DATABASE_NAME"
echo "🔧 Port: $DATABASE_PORT"

# Check if the container is running
echo "🔍 Verifying container status..."
docker ps | grep ligenia_db_test

echo "🧪 You can now run: cd backend && npm run test" 