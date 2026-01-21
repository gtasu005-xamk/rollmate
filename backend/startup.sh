#!/bin/bash
set -e

echo "=== Starting Rollmate Backend ==="

# Prisma migrations
echo "Running database migrations..."
npm run prisma:deploy


echo "Starting Node.js application..."
npm run start:prod
