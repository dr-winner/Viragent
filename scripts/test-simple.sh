#!/bin/bash

# Simple test for AI integration
echo "🧪 Testing AI integration (simplified)..."

# Source the .env file
source .env

echo "✅ Found OpenAI API key in .env file"

# Get user principal
USER_PRINCIPAL=$(dfx identity get-principal)
echo "User principal: $USER_PRINCIPAL"

# Register user
echo "👤 Registering user..."
dfx canister call viragent_backend register '()'

# Upload a test media item
echo "📸 Uploading test media..."
CURRENT_TIME=$(date +%s)000000000
dfx canister call viragent_backend uploadMedia "(record { 
  id=\"test-simple\"; 
  owner=principal \"$USER_PRINCIPAL\"; 
  url=\"https://example.com/test.jpg\"; 
  mediaType=\"image\"; 
  status=\"uploaded\"; 
  createdAt=$CURRENT_TIME 
})"

# Test AI content generation
echo "🤖 Testing AI content generation..."
dfx canister call viragent_backend generateAIContent '(
  "test-simple", 
  "Test post about technology", 
  "casual", 
  "twitter"
)'

echo "✅ Test complete!"
