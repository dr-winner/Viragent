#!/bin/bash

# Script to initialize Viragent with OpenAI API key from .env file

echo "🤖 Initializing Viragent with OpenAI integration..."

# Source the .env file to get the OpenAI API key
if [ -f ".env" ]; then
    source .env
    echo "✅ Found .env file"
else
    echo "❌ .env file not found!"
    exit 1
fi

# Check if OpenAI API key exists
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY not found in .env file!"
    exit 1
fi

echo "✅ OpenAI API key found (${OPENAI_API_KEY:0:10}...)"

# Start local network if not running
echo "🚀 Starting local IC network..."
dfx start --background --clean

# Deploy the canisters
echo "📦 Deploying canisters..."
dfx deploy

# Get the backend canister ID
BACKEND_CANISTER_ID=$(dfx canister id viragent_backend)
echo "🎯 Backend canister ID: $BACKEND_CANISTER_ID"

# Initialize the system with OpenAI
echo "🔧 Initializing system with OpenAI..."
dfx canister call viragent_backend initWithOpenAIKey "(\"$OPENAI_API_KEY\")"

echo "🎉 OpenAI integration setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Register a user: dfx canister call viragent_backend register '()'"
echo "2. Upload media: dfx canister call viragent_backend uploadMedia '(record { id=\"test1\"; owner=principal \"$(dfx identity get-principal)\"; mediaType=\"image\"; url=\"https://example.com/image.jpg\"; uploadedAt=$(date +%s)000000000 })'"
echo "3. Generate AI content: dfx canister call viragent_backend generateAIContent '(\"test1\", \"Create a post about innovation\", \"professional\", \"linkedin\")'"
echo ""
echo "🌐 Frontend: http://localhost:4943/?canisterId=$CANISTER_ID_VIRAGENT_FRONTEND"
echo "🔧 Backend Candid UI: http://localhost:4943/?canisterId=$(dfx canister id __Candid_UI)&id=$BACKEND_CANISTER_ID"
