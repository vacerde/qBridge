#!/bin/bash

# qBridge Backend Startup Script

set -e

echo "🚀 Starting qBridge Backend..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before running again."
    exit 1
fi

# Create necessary directories
mkdir -p logs
mkdir -p /workspace-data

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start services based on environment
if [ "$NODE_ENV" = "production" ]; then
    echo "🏭 Starting production environment..."
    docker-compose up -d
    echo "✅ qBridge Backend is running in production mode"
    echo "🌐 API available at: http://localhost:9000"
    echo "📊 Health check: http://localhost:9000/health"
else
    echo "🛠️  Starting development environment..."

    # Start MongoDB and Redis if not running
    if ! docker ps | grep -q mongo; then
        echo "🍃 Starting MongoDB..."
        docker run -d --name qBridge-mongo -p 27017:27017 mongo:6.0
    fi
    
    if ! docker ps | grep -q qBridge-redis; then
        echo "🔴 Starting Redis..."
        docker run -d --name qBridge-redis -p 6379:6379 redis:7-alpine
    fi
    
    # Start the application
    echo "🚀 Starting qBridge Backend in development mode..."
    npm run dev
fi

echo "🎉 qBridge Backend startup complete!"
