# API Test Suite

This directory contains comprehensive automated tests for the Agent Library API across all three platform implementations (Node.js, Python, .NET).

## Directory Structure

```
tests/
├── api/                    # Functional API tests
│   ├── health.spec.ts     # Health check endpoint (TC-001)
│   ├── users.spec.ts      # User management (TC-002 to TC-020)
│   ├── posts.spec.ts      # Post management (TC-021 to TC-030)
│   ├── search.spec.ts     # Search functionality (TC-031 to TC-036)
│   ├── stats.spec.ts      # Statistics endpoint (TC-037 to TC-039)
│   └── error-handling.spec.ts  # Error handling (TC-040 to TC-044)
├── security/              # Security tests
│   ├── headers.spec.ts    # CORS, security headers, XSS, SQL injection
│   └── rate-limiting.spec.ts  # Rate limiting tests
├── performance/           # Performance tests
│   └── response-time.spec.ts  # Response time benchmarks
├── cross-platform/        # Cross-platform consistency
│   └── consistency.spec.ts    # API contract validation
└── README.md             # This file
```

## Test Coverage

- **63 Test Cases** covering all API endpoints
- **Functional Testing**: CRUD operations, validation, pagination
- **Security Testing**: CORS, headers, rate limiting, injection prevention
- **Performance Testing**: Response times, concurrent requests
- **Cross-Platform Testing**: API contract consistency

## Prerequisites

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Install Playwright**:
   ```bash
   npx playwright install
   ```

3. **Start your API server** (choose one platform):
   ```bash
   # Node.js
   cd examples/node && npm start

   # Python
   cd examples/python && python start.py

   # .NET (with rate limiting disabled for testing)
   cd examples/dotnet && DISABLE_RATE_LIMIT=true dotnet run
   ```

   > **Note**: .NET API requires `DISABLE_RATE_LIMIT=true` for testing to avoid HTTP 429 errors. See [DOTNET_TESTING_SETUP.md](../DOTNET_TESTING_SETUP.md) for details.

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# API tests only
npm run test:api

# Security tests only
npm run test:security

# Performance tests only
npm run test:performance
```

### Run Tests Against Specific Platform
```bash
# Node.js (port 3000)
npm run test:node

# Python (port 8000)
npm run test:python

# .NET (port 5000)
npm run test:dotnet
```

### Run Tests Against All Platforms
```bash
npm run test:all-platforms
```

### View Test Report
```bash
npm run test:report
```

## Environment Variables

- `API_URL`: Base URL for the API (default: http://localhost:3000)
- `API_PLATFORM`: Platform identifier (node, python, dotnet)

Example:
```bash
API_URL=http://localhost:8000 npm test
```

## Test Data

Tests use the following seed data (automatically created by each platform):

### Users
- John Doe (john@example.com, age 30)
- Jane Smith (jane@example.com, age 25)
- Bob Johnson (bob@example.com, age 35)

### Posts
- "First Post" by John Doe
- "Second Post" by Jane Smith

## Test Categories

### Functional Tests (42 tests)
- **Health Check** (1 test): API availability
- **User Management** (19 tests): CRUD operations, validation, pagination
- **Post Management** (10 tests): CRUD operations, author relationships
- **Search** (6 tests): User search by name/email
- **Statistics** (3 tests): Aggregate calculations
- **Error Handling** (5 tests): 404, malformed requests, invalid data

### Security Tests (6 tests)
- **CORS Headers**: Cross-origin request handling
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **SQL Injection**: Input sanitization
- **XSS Prevention**: Script injection protection
- **Rate Limiting**: Request throttling (2 tests, skipped by default)

### Performance Tests (5 tests)
- **Response Time**: Health check, GET users, CREATE user
- **Concurrent Requests**: 50 parallel requests
- **Connection Pooling**: 100 concurrent operations

### Cross-Platform Tests (3 tests, skipped by default)
- **Response Format**: JSON structure consistency
- **Error Handling**: Error format consistency
- **Validation**: Validation behavior consistency

## Skipped Tests

Some tests are skipped by default:

1. **Rate Limiting Tests**: Require 100+ requests and 15-minute wait
2. **Cross-Platform Tests**: Require all three platforms running simultaneously

To run skipped tests, remove the `test.skip` in the test files.

## Debugging

### Run Tests in Debug Mode
```bash
npx playwright test --debug
```

### Run Specific Test
```bash
npx playwright test tests/api/users.spec.ts
```

### Run Tests with Verbose Output
```bash
npx playwright test --reporter=list
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Cleanup**: Tests create temporary data with unique emails/timestamps
3. **Assertions**: Use specific assertions with clear error messages
4. **Performance**: Performance tests have relaxed criteria for CI environments
5. **Timeouts**: Default timeout is 30 seconds per test

## Troubleshooting

### Tests Failing with "Connection Refused"
- Ensure the API server is running on the correct port
- Check the `API_URL` environment variable

### Rate Limiting Tests Failing
- Rate limiting tests are intensive and may affect other tests
- Run them separately: `npx playwright test tests/security/rate-limiting.spec.ts`

### Performance Tests Failing
- Performance criteria assume local development environment
- CI environments may be slower; adjust thresholds as needed

### Cross-Platform Tests Skipped
- These require all three platforms running simultaneously
- Start all servers, then remove `test.skip` from the tests

## Contributing

When adding new tests:

1. Follow the existing naming convention: `TC-XXX: Test Description`
2. Add test case to `API_TEST_PLAN.md`
3. Include both positive and negative test cases
4. Add cleanup code for any created resources
5. Update this README with new test information

## Support

For issues or questions:
- Review the [API Test Plan](../API_TEST_PLAN.md)
- Check [Playwright documentation](https://playwright.dev)
- File an issue in the repository
