#!/bin/bash

# Comprehensive verification test for NTT Market implementation
# Tests all the requirements from .github/verification.md

BASE_URL="http://localhost:3000"

echo "🚀 Starting NTT Market Verification Tests"
echo "========================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$BASE_URL$endpoint" -H "Accept: application/json")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" "$BASE_URL$endpoint" \
                  -H "Content-Type: application/json" \
                  -H "Accept: application/json" \
                  -d "$data")
    fi
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" -eq "$expected_status" ] 2>/dev/null; then
        echo -e "${GREEN}✅ PASSED${NC} (Status: $http_code)"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAILED${NC} (Expected: $expected_status, Got: $http_code)"
        echo "Response: ${body:0:100}..."
        FAILED=$((FAILED + 1))
    fi
    
    # Log the response for debugging
    echo "  Response body: ${body:0:200}..." >> verification.log
    echo "" >> verification.log
}

# Initialize log file
echo "NTT Market Verification Test Log - $(date)" > verification.log
echo "================================================" >> verification.log
echo "" >> verification.log

echo "📊 Testing Basic API Endpoints..."
echo "----------------------------------"
test_endpoint "Stats API" "GET" "/api/stats" "" "200"
test_endpoint "Businesses API" "GET" "/api/businesses" "" "200" 
test_endpoint "Shops API" "GET" "/api/shops" "" "200"
echo ""

echo "🔐 Testing Authentication Endpoints..."
echo "-------------------------------------"
test_endpoint "Auth Check Email" "POST" "/api/auth/check-email" '{"email":"test@example.com"}' "200"
echo ""

echo "💳 Testing Stripe Security (Should be Unauthorized)..."
echo "------------------------------------------------------"
test_endpoint "Stripe Checkout (Unauthorized)" "POST" "/api/stripe/checkout" '{"stakeholder_id":"test-123","plan":"basic"}' "401"
test_endpoint "Stripe Webhook (No Signature)" "POST" "/api/stripe/webhook" '{"test":"webhook"}' "400"
echo ""

echo "🖼️ Testing Image Endpoints..."
echo "-----------------------------"
test_endpoint "Image Sign (Unauthorized)" "POST" "/api/images/sign" '{"fileName":"test.jpg","fileType":"image/jpeg"}' "401"
echo ""

echo "🔒 Testing Protected Endpoints..."
echo "--------------------------------"
test_endpoint "Memberships (Unauthorized)" "GET" "/api/memberships" "" "401"
test_endpoint "Orders (Unauthorized)" "GET" "/api/orders" "" "401"
test_endpoint "Reviews API" "GET" "/api/reviews" "" "200"
test_endpoint "Stakeholders (Unauthorized)" "GET" "/api/stakeholders" "" "401"
echo ""

echo "🎫 Testing Additional Endpoints..."
echo "---------------------------------"
test_endpoint "Ads Ticker" "GET" "/api/ads/ticker" "" "200"
test_endpoint "Vouchers (Unauthorized)" "GET" "/api/vouchers" "" "401"
echo ""

# Test middleware exclusion
echo "⚙️  Testing Middleware (Stripe Routes Should Not be Affected)..."
echo "---------------------------------------------------------------"
echo "  Note: Stripe routes should bypass middleware for performance"
test_endpoint "Stripe Webhook Bypass Check" "POST" "/api/stripe/webhook" '{}' "400"
echo ""

# Summary
echo "========================================"
echo "📈 TEST RESULTS SUMMARY"
echo "========================================"
echo -e "✅ PASSED: ${GREEN}$PASSED${NC}"
echo -e "❌ FAILED: ${RED}$FAILED${NC}"
echo -e "📊 TOTAL:  $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}ALL TESTS PASSED!${NC}"
    echo "The implementation meets the verification requirements."
else
    echo -e "\n⚠️  ${YELLOW}SOME TESTS FAILED${NC}"
    echo "Please check the failed tests and fix the issues."
fi

echo ""
echo "📝 Detailed log saved to: verification.log"
echo ""

# Environment check
echo "🔧 ENVIRONMENT CHECK:"
echo "====================="
echo "Make sure these environment variables are set in your .env.local:"
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY" 
echo "- SUPABASE_SERVICE_ROLE_KEY"
echo "- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
echo "- STRIPE_SECRET_KEY"
echo "- STRIPE_WEBHOOK_SECRET"
echo "- NEXT_PUBLIC_SITE_URL"
echo ""

# Check if dev server is running
if curl -s "$BASE_URL" > /dev/null; then
    echo -e "✅ Development server is running at $BASE_URL"
else
    echo -e "❌ Development server is NOT running at $BASE_URL"
    echo "   Please start it with: npm run dev"
fi

echo ""
echo "✨ Verification completed!"