#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting production server..."
echo "Environment: $NODE_ENV"
echo "Database URL: ${DATABASE_URL:0:30}..."

# Function to handle errors
handle_error() {
    echo "❌ Error occurred during startup: $1"
    exit 1
}

# Check required environment variables
if [ -z "$DATABASE_URL" ]; then
    handle_error "DATABASE_URL environment variable is required"
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    handle_error "NEXTAUTH_SECRET environment variable is required"
fi

if [ -z "$NEXTAUTH_URL" ]; then
    handle_error "NEXTAUTH_URL environment variable is required"
fi

# Test database connection
echo "🔍 Testing database connection..."
npx prisma db pull --force-reset || handle_error "Database connection failed"

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy || handle_error "Database migrations failed"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate || handle_error "Prisma client generation failed"

# Seed database (optional, don't fail if it doesn't work)
echo "🌱 Seeding database..."
npm run seed || echo "⚠️  Seeding failed, but continuing..."

# Start the application
echo "🌟 Starting Next.js server on port 8080..."
exec next start -p 8080