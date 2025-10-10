# Express Demo Application

This is a demonstration Express.js application designed to showcase the capabilities of GitHub Copilot expert agents for code review and test coverage analysis.

## Features

### API Endpoints

#### Users Management
- `GET /api/users` - Get all users with pagination
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Posts Management
- `GET /api/posts` - Get all posts with author information
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create new post

#### Search & Analytics
- `GET /api/search/users?q=query` - Search users by name or email
- `GET /api/stats` - Get user and post statistics

#### Health Check
- `GET /health` - Application health status

### Security Features
- **Helmet.js** for security headers
- **CORS** enabled
- **Rate limiting** (100 requests per 15 minutes per IP)
- **Input validation** using express-validator
- **Error handling** middleware

### Data Validation
- User validation: name, email format, age range (1-120)
- Post validation: title, content, valid author ID
- Duplicate email prevention
- Foreign key validation (author exists for posts)

## Getting Started

### Prerequisites
- Node.js 14.0.0 or higher
- npm or yarn

### Installation

1. Navigate to the demo directory:
   ```bash
   cd examples/node
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

4. The server will start on port 3000 (or PORT environment variable)

### Testing

Run the test suite:
```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## API Usage Examples

### Create a user
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  }'
```

### Get users with pagination
```bash
curl "http://localhost:3000/api/users?page=1&limit=5"
```

### Create a post
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of my first post",
    "authorId": 1
  }'
```

### Search users
```bash
curl "http://localhost:3000/api/search/users?q=john"
```

### Get statistics
```bash
curl http://localhost:3000/api/stats
```

## Demo Scenarios for Expert Agents

This application is designed to demonstrate various aspects that the GitHub Copilot expert agents can analyze:

### Code Review Expert Scenarios
- **Security vulnerabilities** (potential SQL injection points, input validation)
- **Error handling** patterns
- **Code organization** and structure
- **Performance considerations** (N+1 queries, inefficient loops)
- **Best practices** adherence
- **Middleware usage** and order

### Test Coverage Expert Scenarios
- **Missing test cases** for edge conditions
- **Integration vs unit test** coverage
- **Error condition testing**
- **Input validation testing**
- **API endpoint coverage**
- **Mock and stub usage**
- **Test organization** and structure

## Code Quality Issues (Intentional)

This application contains several intentional code quality issues for demonstration:

1. **In-memory database** - Not suitable for production
2. **Lack of authentication** - No user authentication/authorization
3. **Missing input sanitization** - Potential XSS vulnerabilities
4. **Inefficient data lookups** - Linear search in arrays
5. **No database transactions** - Data consistency issues
6. **Limited error messages** - Generic error responses
7. **No logging framework** - Basic console.log usage
8. **Missing environment configuration** - Hardcoded values
9. **No API versioning** - Breaking changes potential
10. **Limited test coverage** - Missing edge cases

These issues provide excellent opportunities for the expert agents to identify and suggest improvements.

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## License

MIT License - see the main project LICENSE file.