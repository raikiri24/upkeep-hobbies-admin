#!/bin/bash

# Test script for localhost:4000 auth endpoint

echo "🧪 Testing localhost:4000/auth endpoint..."

# Check if server is running
if curl -s --connect-timeout 3 http://localhost:4000/upk/auth > /dev/null; then
    echo "✅ Server is responding on port 4000"
else
    echo "❌ Server not responding on port 4000"
    echo "💡 Make sure your auth server is running:"
    echo "   node auth-server.js"
    echo ""
    echo "📝 Example auth server code provided in AUTH-SETUP.md"
    exit 1
fi

# Test login with admin credentials
echo ""
echo "🔐 Testing admin login..."
response=$(curl -s -X POST http://localhost:4000/upk/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@upkeep.com","password":"password123"}')

echo "Response: $response"

# Extract token from response (basic parsing)
if echo "$response" | grep -q '"success":true'; then
    echo "✅ Admin login successful!"
    
        # Extract accessToken (updated for your API)
        token=$(echo "$response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        if [ -z "$token" ]; then
            # Fallback to accessKey if accessToken not found
            token=$(echo "$response" | grep -o '"accessKey":"[^"]*"' | cut -d'"' -f4)
        fi
        
        if [ ! -z "$token" ]; then
            echo "🔑 Token received: ${token:0:50}..."
            
            # Test token verification
            echo ""
            echo "🔍 Testing token verification..."
            verify_response=$(curl -s -X POST http://localhost:4000/upk/auth/verify \
              -H "Content-Type: application/json" \
              -d "{\"accessToken\":\"$token\"}")
            
            echo "Verification response: $verify_response"
            
            if echo "$verify_response" | grep -q '"valid":true'; then
                echo "✅ Token verification successful!"
            else
                echo "❌ Token verification failed"
            fi
        fi
else
    echo "❌ Admin login failed"
fi

echo ""
echo "🎯 Your React SPA is now configured to use this endpoint!"
echo "📱 Go to http://localhost:3000 and test the login"