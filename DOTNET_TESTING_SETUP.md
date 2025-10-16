# .NET API Testing Setup

## Issue
The .NET API has rate limiting enabled (100 requests per 15 minutes per IP), which causes Playwright tests to fail with HTTP 429 errors when running the test suite.

## Solution
The .NET API has been updated to support disabling rate limiting for testing purposes via an environment variable.

## Quick Start

### 1. Stop the Current .NET Server
```bash
# Find and kill the .NET process
pkill -f AgentLibraryDotNet
```

### 2. Start .NET API with Rate Limiting Disabled
```bash
cd examples/dotnet
DISABLE_RATE_LIMIT=true dotnet run
```

### 3. Seed the Database (in a new terminal)
```bash
# Create a test user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "age": 30
  }'

# Create another user for testing
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "age": 25
  }'

# Verify users were created
curl http://localhost:5000/api/users
```

### 4. Run Tests Against .NET API
```bash
# From the root directory
API_URL=http://localhost:5000 npx playwright test tests/api/users.spec.ts --workers=1
```

## Testing All Endpoints

### Run Full Test Suite Against .NET
```bash
# Run all API tests
API_URL=http://localhost:5000 npx playwright test tests/api --workers=1

# Run specific test categories
API_URL=http://localhost:5000 npx playwright test tests/api/health.spec.ts
API_URL=http://localhost:5000 npx playwright test tests/api/users.spec.ts
API_URL=http://localhost:5000 npx playwright test tests/api/posts.spec.ts
```

## Configuration Changes Made

### Program.cs Updates
- Added `DISABLE_RATE_LIMIT` environment variable support
- Rate limiting is now conditionally enabled based on configuration
- Middleware only applied when rate limiting is enabled

### Playwright Config
- Updated to use 1 worker when testing against .NET API (port 5000)
- Prevents parallel requests that could still trigger rate limits

## Production vs Testing

### Production (Rate Limiting Enabled)
```bash
cd examples/dotnet
dotnet run
```

### Testing (Rate Limiting Disabled)
```bash
cd examples/dotnet
DISABLE_RATE_LIMIT=true dotnet run
```

## Troubleshooting

### Still Getting 429 Errors?
1. Make sure you stopped the old .NET server
2. Restart with `DISABLE_RATE_LIMIT=true`
3. Wait 15 minutes for rate limit counter to reset, or restart server

### Getting 404 Errors?
The database needs to be seeded with test data. Run the curl commands above to create test users.

### Tests Pass Against Node but Fail Against .NET?
This could indicate API behavior differences:
- Check response formats
- Verify error messages match
- Confirm validation rules are identical

## Alternative: Reset Rate Limit Counter
If you can't restart the server, wait 15 minutes for the rate limit window to reset, or delete the in-memory cache by restarting the application.

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `API_URL` | Target API endpoint | `http://localhost:5000` |
| `DISABLE_RATE_LIMIT` | Disable rate limiting | `true` or `false` |

## Next Steps

After confirming tests pass against .NET:
1. Run full test suite against all three platforms
2. Document any platform-specific differences
3. Update API_TEST_PLAN.md with findings
