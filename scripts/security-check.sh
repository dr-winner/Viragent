#!/bin/bash

# Security verification script before GitHub push
echo "🔍 SECURITY VERIFICATION FOR GITHUB PUSH"
echo "========================================"

# Check if .env exists and is gitignored
if [ -f .env ]; then
    if git check-ignore .env >/dev/null 2>&1; then
        echo "✅ .env file is properly gitignored"
    else
        echo "❌ CRITICAL: .env file is NOT gitignored!"
        exit 1
    fi
else
    echo "ℹ️  No .env file found (this is fine)"
fi

# Check for sensitive patterns in staged changes
echo "🔍 Checking staged changes for sensitive data..."

SENSITIVE_PATTERNS=("sk-proj-[A-Za-z0-9]{48,}" "ghp_[A-Za-z0-9]{36,}" "sk-ant-[A-Za-z0-9]+" "xoxb-[A-Za-z0-9]+")
FOUND_SENSITIVE=false

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if git diff --cached | grep -E "$pattern" >/dev/null 2>&1; then
        echo "❌ CRITICAL: Found potential real API key pattern: $pattern"
        FOUND_SENSITIVE=true
    fi
done

if [ "$FOUND_SENSITIVE" = true ]; then
    echo ""
    echo "🚨 STOP! Sensitive data detected in staged changes!"
    echo "Please review and remove any real API keys before pushing."
    exit 1
fi

echo "✅ No sensitive data patterns found in staged changes"
echo ""
echo "🎉 SECURITY CHECK PASSED - SAFE TO PUSH TO GITHUB!"
echo ""
echo "📝 Remember:"
echo "   - Contributors will need to create their own .env from .env.example"
echo "   - API keys should never be shared in public repositories"
echo "   - Local canister IDs are safe to include (they're development-only)"
