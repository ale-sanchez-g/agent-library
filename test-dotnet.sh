#!/bin/bash

# Setup and run .NET API tests
# This script handles the complete setup for testing the .NET API

echo "🔧 .NET API Testing Setup"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .NET is installed
if ! command -v dotnet &> /dev/null; then
    echo -e "${RED}❌ .NET SDK not found. Please install .NET 8.0 or higher.${NC}"
    exit 1
fi

# Step 1: Check if server is running
echo "📡 Checking if .NET API is running on port 5000..."
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ .NET API is already running${NC}"
else
    echo -e "${YELLOW}⚠️  .NET API is not running${NC}"
    echo "Start it with: DISABLE_RATE_LIMIT=true dotnet run DISABLE_RATE_LIMIT=true dotnet run"
    echo "From directory: examples/dotnet"
    exit 1
fi

# Step 2: Check if rate limiting is disabled
echo ""
echo "🔍 Checking rate limiting status..."
# Make 5 quick requests to test rate limiting
RATE_LIMIT_ACTIVE=false
for i in {1..5}; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
    if [ "$STATUS" = "429" ]; then
        RATE_LIMIT_ACTIVE=true
        break
    fi
done

if [ "$RATE_LIMIT_ACTIVE" = true ]; then
    echo -e "${RED}❌ Rate limiting is still active (HTTP 429)${NC}"
    echo "Please restart the server with: DISABLE_RATE_LIMIT=true dotnet run"
    exit 1
else
    echo -e "${GREEN}✅ Rate limiting is disabled${NC}"
fi

# Step 3: Check database state
echo ""
echo "💾 Checking database state..."
USER_COUNT=$(curl -s http://localhost:5000/api/users | grep -o '"total":[0-9]*' | grep -o '[0-9]*')

if [ -z "$USER_COUNT" ] || [ "$USER_COUNT" = "0" ]; then
    echo -e "${YELLOW}⚠️  Database is empty${NC}"
    echo "Would you like to seed the database? (y/n)"
    read -r SEED_DB
    
    if [ "$SEED_DB" = "y" ] || [ "$SEED_DB" = "Y" ]; then
        echo ""
        echo "🌱 Seeding database with test data..."
        
        # Create test users
        curl -s -X POST http://localhost:5000/api/users \
          -H "Content-Type: application/json" \
          -d '{"name": "John Doe", "email": "john@example.com", "age": 30}' > /dev/null
        
        curl -s -X POST http://localhost:5000/api/users \
          -H "Content-Type: application/json" \
          -d '{"name": "Jane Smith", "email": "jane@example.com", "age": 25}' > /dev/null
        
        curl -s -X POST http://localhost:5000/api/users \
          -H "Content-Type: application/json" \
          -d '{"name": "Bob Wilson", "email": "bob@example.com", "age": 35}' > /dev/null
        
        echo -e "${GREEN}✅ Database seeded with 3 test users${NC}"
    fi
else
    echo -e "${GREEN}✅ Database has $USER_COUNT users${NC}"
fi

# Step 4: Run tests
echo ""
echo "🧪 Running Playwright tests..."
echo ""

# Ask which tests to run
echo "Select test scope:"
echo "1) All tests"
echo "2) API tests only"
echo "3) Users tests only"
echo "4) Health check only"
read -r TEST_SCOPE

case $TEST_SCOPE in
    1)
        API_URL=http://localhost:5000 npx playwright test --workers=1
        ;;
    2)
        API_URL=http://localhost:5000 npx playwright test tests/api --workers=1
        ;;
    3)
        API_URL=http://localhost:5000 npx playwright test tests/api/users.spec.ts --workers=1
        ;;
    4)
        API_URL=http://localhost:5000 npx playwright test tests/api/health.spec.ts --workers=1
        ;;
    *)
        echo -e "${RED}Invalid selection${NC}"
        exit 1
        ;;
esac

# Check test results
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Check the output above.${NC}"
    exit 1
fi
