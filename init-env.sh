#!/bin/bash

# Load environment variables and initialize backend with API keys
# This script reads from .env file and calls the backend init method

# Source the .env file
if [ -f .env ]; then
    source .env
    echo "✅ Environment variables loaded from .env"
else
    echo "❌ .env file not found"
    exit 1
fi

# Check if required variables exist
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY not found in .env"
    exit 1
fi

if [ -z "$CLAUDE_API_KEY" ]; then
    echo "⚠️  CLAUDE_API_KEY not found in .env (optional)"
fi

echo "🚀 Initializing backend with API keys..."

# Initialize backend with environment variables
dfx canister call viragent_backend init "(opt \"$OPENAI_API_KEY\", opt \"$CLAUDE_API_KEY\")"

if [ $? -eq 0 ]; then
    echo "✅ Backend initialized successfully with environment variables!"
    echo "🔧 OpenAI API Key: ${OPENAI_API_KEY:0:20}..."
    if [ ! -z "$CLAUDE_API_KEY" ]; then
        echo "🔧 Claude API Key: ${CLAUDE_API_KEY:0:20}..."
    fi
else
    echo "❌ Failed to initialize backend"
    exit 1
fi
