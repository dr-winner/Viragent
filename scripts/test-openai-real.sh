#!/bin/bash

# Test script for OpenAI integration with real API key
echo "🧪 Testing OpenAI integration with real API key..."

# Check if .env file exists and has OpenAI key
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it with your OpenAI API key."
    echo "Example:"
    echo "OPENAI_API_KEY=sk-your-actual-openai-api-key-here"
    exit 1
fi

# Source the .env file
source .env

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY not found in .env file."
    echo "Please add your OpenAI API key to .env file:"
    echo "OPENAI_API_KEY=sk-your-actual-openai-api-key-here"
    exit 1
fi

echo "✅ Found OpenAI API key in .env file"

# Deploy the canisters if needed
echo "🚀 Deploying canisters..."
dfx deploy

# Check canister cycles balance
echo "💰 Checking canister cycles..."
dfx canister status viragent_backend

# Register a user first
echo "👤 Registering user..."
REGISTER_RESULT=$(dfx canister call viragent_backend register '()')
echo "Registration result: $REGISTER_RESULT"

# Initialize with OpenAI key
echo "🔧 Initializing backend with OpenAI API key..."
INIT_RESULT=$(dfx canister call viragent_backend initWithOpenAIKey "(\"$OPENAI_API_KEY\")")
echo "Initialization result: $INIT_RESULT"

# Get user principal
USER_PRINCIPAL=$(dfx identity get-principal)
echo "User principal: $USER_PRINCIPAL"

# Upload a test media item
echo "📸 Uploading test media..."
CURRENT_TIME=$(date +%s)000000000
MEDIA_RESULT=$(dfx canister call viragent_backend uploadMedia "(record { 
  id=\"test-media-openai\"; 
  owner=principal \"$USER_PRINCIPAL\"; 
  url=\"https://example.com/test-image.jpg\"; 
  mediaType=\"image\"; 
  status=\"uploaded\"; 
  createdAt=$CURRENT_TIME 
})")
echo "Media upload result: $MEDIA_RESULT"

# Test OpenAI content generation with different scenarios
echo ""
echo "🤖 Testing OpenAI content generation..."

echo "--- Test 1: Professional LinkedIn post ---"
AI_RESULT_1=$(dfx canister call viragent_backend generateAIContent '(
  "test-media-openai", 
  "Share insights about the future of AI in business and how it will transform industries", 
  "professional", 
  "linkedin"
)')
echo "Result: $AI_RESULT_1"

echo ""
echo "--- Test 2: Casual Instagram post ---"
AI_RESULT_2=$(dfx canister call viragent_backend generateAIContent '(
  "test-media-openai", 
  "Beautiful sunset at the beach with friends enjoying the moment", 
  "casual", 
  "instagram"
)')
echo "Result: $AI_RESULT_2"

echo ""
echo "--- Test 3: Twitter post ---"
AI_RESULT_3=$(dfx canister call viragent_backend generateAIContent '(
  "test-media-openai", 
  "Just discovered an amazing new technology that will change everything", 
  "casual", 
  "twitter"
)')
echo "Result: $AI_RESULT_3"

# Check AI outputs
echo ""
echo "📋 Checking generated AI output..."
OUTPUT_RESULT=$(dfx canister call viragent_backend getOutput '("test-media-openai")')
echo "AI Output: $OUTPUT_RESULT"

# Test system health
echo ""
echo "🏥 Checking system health..."
HEALTH_RESULT=$(dfx canister call viragent_backend health '()')
echo "Health: $HEALTH_RESULT"

echo ""
echo "✅ OpenAI integration test complete!"
echo "🎉 If you see content generated above, OpenAI integration is working!"
