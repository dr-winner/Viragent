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
if [ -z "$GITHUB_TOKEN" ] && [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Either GITHUB_TOKEN or OPENAI_API_KEY must be provided in .env"
    exit 1
fi

if [ ! -z "$GITHUB_TOKEN" ]; then
    echo "🔧 Using GitHub Models (free) with token: ${GITHUB_TOKEN:0:20}..."
fi

if [ ! -z "$OPENAI_API_KEY" ]; then
    echo "🔧 OpenAI API Key found: ${OPENAI_API_KEY:0:20}..."
fi

if [ -z "$CLAUDE_API_KEY" ]; then
    echo "⚠️  CLAUDE_API_KEY not found in .env (optional)"
fi

echo "🚀 Initializing backend with API keys..."

#!/bin/bash

# Load environment variables and initialize backend with GitHub token for FREE AI
# This script reads from .env file and calls the backend init method

# Source the .env file
if [ -f .env ]; then
    source .env
    echo "✅ Environment variables loaded from .env"
else
    echo "❌ .env file not found"
    exit 1
fi

# Check if GitHub token exists
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GITHUB_TOKEN not found in .env"
    echo "💡 Get your FREE GitHub token at: https://github.com/settings/tokens"
    echo "💡 No special permissions needed - just generate a basic token for FREE AI access!"
    exit 1
fi

echo "🔧 Using GitHub Models (FREE) with token: ${GITHUB_TOKEN:0:20}..."

echo "🚀 Initializing backend with FREE GitHub AI..."

# Initialize backend with GitHub token only
dfx canister call viragent_backend init "(opt \"$GITHUB_TOKEN\")"

if [ $? -eq 0 ]; then
    echo "✅ Backend initialized successfully with FREE GitHub AI!"
    echo "🎉 You now have unlimited FREE AI content generation!"
    echo "🔧 GitHub Token: ${GITHUB_TOKEN:0:20}..."
    echo ""
    echo "🌐 Your Viragent app is ready at:"
    echo "   http://$(dfx canister id viragent_frontend).localhost:4943"
else
    echo "❌ Failed to initialize backend"
    exit 1
fi

if [ $? -eq 0 ]; then
    echo "✅ Backend initialized successfully with environment variables!"
    if [ ! -z "$GITHUB_TOKEN" ]; then
        echo "🔧 GitHub Token: ${GITHUB_TOKEN:0:20}... (GitHub Models - FREE)"
    fi
    if [ ! -z "$OPENAI_API_KEY" ]; then
        echo "🔧 OpenAI API Key: ${OPENAI_API_KEY:0:20}..."
    fi
    if [ ! -z "$CLAUDE_API_KEY" ]; then
        echo "🔧 Claude API Key: ${CLAUDE_API_KEY:0:20}..."
    fi
else
    echo "❌ Failed to initialize backend"
    exit 1
fi
