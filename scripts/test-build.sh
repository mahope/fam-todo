#!/bin/bash

# Test build script for local verification before deployment

echo "🧪 Testing build process locally..."
echo "=================================="

cd apps/web

echo "1️⃣  Installing dependencies..."
npm ci

if [ $? -ne 0 ]; then
  echo "❌ npm ci failed"
  exit 1
fi

echo "2️⃣  Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
  echo "❌ Prisma generate failed"
  exit 1
fi

echo "3️⃣  Building Next.js application..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Next.js build failed"
  exit 1
fi

echo "✅ Build test completed successfully!"
echo "Ready for deployment 🚀"