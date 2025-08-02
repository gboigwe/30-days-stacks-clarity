#!/bin/bash
# Development script for Day 3 Advanced Interactions

echo "🚀 Day 3: Advanced Stacks Interactions - Making Your dApp Interactive"
echo "================================================================="

echo ""
echo "📋 Checking smart contract..."
clarinet check

if [ $? -eq 0 ]; then
    echo "✅ Smart contract syntax is valid!"
    echo ""
    echo "🌐 Starting interactive frontend development server..."
    echo "Features available:"
    echo "  • Wallet connection and management"
    echo "  • Read data from enhanced smart contract"
    echo "  • Write to blockchain with optimistic UI"
    echo "  • Real-time transaction monitoring"
    echo "  • User-friendly error handling"
    echo ""
    echo "Visit http://localhost:3000 to see your interactive dApp"
    echo "Press Ctrl+C to stop the development server"
    echo ""
    
    cd frontend && npm run dev
else
    echo "❌ Smart contract has errors. Please fix them before running the frontend."
    exit 1
fi