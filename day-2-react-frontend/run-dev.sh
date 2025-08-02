#!/bin/bash
# Development script for Day 2 React Frontend

echo "🚀 Day 2: React Frontend for Stacks dApp"
echo "========================================"

echo ""
echo "📋 Checking contract..."
clarinet check

if [ $? -eq 0 ]; then
    echo "✅ Contract check passed!"
    echo ""
    echo "🌐 Starting frontend development server..."
    echo "Visit http://localhost:3000 to see your dApp"
    echo ""
    echo "To stop the server, press Ctrl+C"
    echo ""
    cd frontend && npm run dev
else
    echo "❌ Contract check failed. Please fix errors before running the frontend."
    exit 1
fi