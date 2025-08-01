#!/bin/bash

# Vercel deployment test script
echo "🚀 Testing Vercel Deployment Auth Endpoints"

# Get the Vercel URL (replace with your actual URL)
VERCEL_URL="https://your-app.vercel.app"

# Test if you want to use localhost instead for comparison
# VERCEL_URL="http://localhost:3001"

echo "📍 Testing URL: $VERCEL_URL"

# Test 1: Check if signup endpoint is accessible
echo "1️⃣  Testing signup endpoint accessibility..."
curl -s -X POST "$VERCEL_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"test": "accessibility"}' \
  | head -c 200

echo -e "\n"

# Test 2: Try a real signup (you can modify the email)
echo "2️⃣  Testing actual signup..."
curl -s -X POST "$VERCEL_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-'$(date +%s)'@example.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User",
    "userType": "customer"
  }' | jq '.' 2>/dev/null || echo "Response received (not JSON formatted)"

echo -e "\n"

# Test 3: Check signin endpoint
echo "3️⃣  Testing signin endpoint accessibility..."
curl -s -X POST "$VERCEL_URL/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"test": "accessibility"}' \
  | head -c 200

echo -e "\n✅ Test complete. Check Vercel logs with: vercel logs"
