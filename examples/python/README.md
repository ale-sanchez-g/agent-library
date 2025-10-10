# FastAPI Demo Application

This is a demonstration FastAPI application migrated from the Node.js Express version, designed to showcase the capabilities of GitHub Copilot expert agents for code review and test coverage analysis.

## Migration from Node.js

This Python application is a direct migration from the Node.js Express application in `../node/`. It maintains the same API endpoints, functionality, and behavior while leveraging Python and FastAPI's modern features.

### Key Migration Changes

- **Framework**: Express.js → FastAPI
- **Language**: JavaScript → Python 3.8+
- **Validation**: express-validator → Pydantic models
- **Testing**: Jest → pytest
- **Server**: Node.js → Uvicorn ASGI server
- **Type Safety**: Added comprehensive type hints and Pydantic models

## Features

### API Endpoints

#### Users Management
- `GET /api/users` - Get all users with pagination
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

#### Posts Management
- `GET /api/posts` - Get all posts with author information
- `GET /api/posts/{id}` - Get post by ID
- `POST /api/posts` - Create new post

#### Search & Analytics
- `GET /api/search/users?q=query` - Search users by name or email
- `GET /api/stats` - Get user and post statistics

#### Health Check
- `GET /health` - Application health status

### Security Features
- **CORS** enabled for cross-origin requests
- **Rate limiting** (100 requests per 15 minutes per IP)
- **Input validation** using Pydantic models
- **Type safety** with comprehensive type hints
- **Error handling** middleware with structured responses

### Data Validation
- User validation: name (required), email format, age range (1-120)
- Post validation: title (required), content (required), valid author ID
- Duplicate email prevention
- Foreign key validation (author exists for posts)

## Getting Started

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Installation

1. Navigate to the demo directory:
   ```bash
   cd examples/python
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the application:
   ```bash
   # Development mode with auto-reload
   uvicorn app:app --reload --port 8000
   
   # Production mode
   python app.py
   ```

5. The server will start on port 8000 (or PORT environment variable)

### Testing

Run the test suite:
```bash
# Run all tests
pytest

# Run tests with coverage
pytest --cov=app --cov-report=html

# Run tests in watch mode (requires pytest-watch)
ptw

# Run specific test file
pytest test_app.py

# Run specific test
pytest test_app.py::TestApp::test_health_endpoint
```

## API Usage Examples

### Create a user
```bash
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  }'
```

### Get users with pagination
```bash
curl "http://localhost:8000/api/users?page=1&limit=5"
```

### Create a post
```bash
curl -X POST http://localhost:8000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of my first post",
    "authorId": 1
  }'
```

### Search users
```bash
curl "http://localhost:8000/api/search/users?q=john"
```

### Get statistics
```bash
curl http://localhost:8000/api/stats
```

## Interactive API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## Migration Benefits

### Advantages of FastAPI over Express.js

1. **Type Safety**: Comprehensive type hints and automatic validation
2. **Documentation**: Auto-generated interactive API documentation
3. **Performance**: High-performance async framework
4. **Modern Python**: Leverages modern Python features and type hints
5. **Validation**: Built-in request/response validation with Pydantic
6. **IDE Support**: Better autocomplete and error detection
7. **Testing**: Excellent testing support with TestClient

### Code Quality Improvements

1. **Type Safety**: All functions have type hints
2. **Validation**: Automatic request/response validation
3. **Error Handling**: Structured error responses with proper HTTP status codes
4. **Async Support**: Built-in async/await support for better performance
5. **Model Validation**: Pydantic models ensure data integrity
6. **Documentation**: Self-documenting API with OpenAPI

## Demo Scenarios for Expert Agents

This application demonstrates various aspects for GitHub Copilot expert agents:

### Code Review Expert Scenarios
- **Type safety** and validation patterns
- **Error handling** with FastAPI exception handlers
- **Security middleware** implementation
- **Code organization** with Pydantic models
- **Performance considerations** with async endpoints
- **Best practices** for REST API design

### Test Coverage Expert Scenarios
- **Comprehensive test suite** with pytest
- **Integration testing** with TestClient
- **Validation testing** for edge cases
- **Error condition testing**
- **API endpoint coverage**
- **Test organization** and structure

## Development Tools

### Useful Commands

```bash
# Install development dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn app:app --reload

# Run tests with coverage
pytest --cov=app

# Format code with black
black app.py test_app.py

# Lint with flake8
flake8 app.py test_app.py

# Type checking with mypy
mypy app.py
```

### Environment Variables

- `PORT` - Server port (default: 8000)
- `LOG_LEVEL` - Logging level (default: info)

## Project Structure

```
examples/python/
├── app.py              # Main FastAPI application
├── test_app.py         # Comprehensive test suite
├── requirements.txt    # Python dependencies
├── pyproject.toml      # pytest configuration
└── README.md           # This file
```

## Comparison with Node.js Version

| Feature | Node.js | Python |
|---------|---------|---------|
| Framework | Express.js | FastAPI |
| Type Safety | Limited (JSDoc) | Full (Type hints) |
| Validation | express-validator | Pydantic |
| Documentation | Manual | Auto-generated |
| Testing | Jest | pytest |
| Performance | Good | Excellent (async) |
| IDE Support | Good | Excellent |

## License

MIT License - see the main project LICENSE file.