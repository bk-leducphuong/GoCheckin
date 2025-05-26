#!/bin/bash

# Simple script to start GoCheckin development environment

echo "🚀 Starting GoCheckin Development Environment..."

# Navigate to docker directory
cd "$(dirname "$0")"

# Start all services
docker compose -f docker-compose.dev.yml up --build

echo "🚀 Development environment stopped!"