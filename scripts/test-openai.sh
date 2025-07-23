#!/bin/bash

# Test script for OpenAI integration
echo "🧪 Testing OpenAI integration..."

# Source the .env file
source .env

# Register a user first
echo "👤 Registering user..."
REGISTER_RESULT=$(dfx canister call viragent_backend register '()')
echo "Registration result: $REGISTER_RESULT"

# Get user principal
USER_PRINCIPAL=$(dfx identity get-principal)
echo "User principal: $USER_PRINCIPAL"

# Upload a test media item
echo "📸 Uploading test media..."
CURRENT_TIME=$(date +%s)000000000
MEDIA_RESULT=$(dfx canister call viragent_backend uploadMedia "(record { 
  id=\"test-media-1\"; 
  owner=principal \"$USER_PRINCIPAL\"; 
  mediaType=\"image\"; 
  url=\"https://example.com/test-image.jpg\"; 
  uploadedAt=$CURRENT_TIME 
})")
echo "Media upload result: $MEDIA_RESULT"

# Test AI content generation with different scenarios
echo ""
echo "🤖 Testing AI content generation..."

echo "--- Test 1: Professional LinkedIn post ---"
AI_RESULT_1=$(dfx canister call viragent_backend generateAIContent '(
  "test-media-1", 
  "Share insights about the future of AI in business", 
  "professional", 
  "linkedin"
)')
echo "Result: $AI_RESULT_1"

echo ""
echo "--- Test 2: Casual Instagram post ---"
AI_RESULT_2=$(dfx canister call viragent_backend generateAIContent '(
  "test-media-1", 
  "Beautiful sunset at the beach", 
  "casual", 
  "instagram"
)')
echo "Result: $AI_RESULT_2"

echo ""
echo "--- Test 3: Twitter post ---"
AI_RESULT_3=$(dfx canister call viragent_backend generateAIContent '(
  "test-media-1", 
  "Just discovered an amazing new technology", 
  "casual", 
  "twitter"
)')
echo "Result: $AI_RESULT_3"

# Check AI outputs
echo ""
echo "📋 Checking generated AI output..."
OUTPUT_RESULT=$(dfx canister call viragent_backend getOutput '("test-media-1")')
echo "AI Output: $OUTPUT_RESULT"

echo ""
echo "✅ OpenAI integration test complete!"
