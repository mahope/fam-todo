#!/bin/bash

# NestList Production Start Script for Nixpacks deployment
# This script runs database migrations and starts the Next.js application

set -e

echo "🚀 Starting NestList deployment..."

# Change to web app directory
cd apps/web

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

echo "📊 Running database migrations..."
npm run migrate:deploy

echo "🔥 Starting Next.js application..."
exec npm run start:prod