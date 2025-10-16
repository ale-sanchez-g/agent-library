# Agent Library API - ASP.NET Core

This is an ASP.NET Core 8 migration of the Express.js application, following enterprise-grade architecture patterns.

## Architecture

This application follows the **Repository Pattern** with a clear separation of concerns:

```
┌─────────────────────────────────────────┐
│     HTTP Requests (Port 5000)           │
└────────────────┬────────────────────────┘
                 │
    ┌────────────▼──────────────┐
    │  ASP.NET Core Pipeline    │
    │  (Built-in Middleware)    │
    └────────────┬──────────────┘
                 │
    ┌────────────▼──────────────────────┐
    │       Controller Layer              │
    │  (UsersController, PostsController)│
    └────────────┬──────────────────────┘
                 │
    ┌────────────▼──────────────────────┐
    │       Service Layer                │
    │  (Business Logic & Validation)     │
    └────────────┬──────────────────────┘
                 │
    ┌────────────▼──────────────────────┐
    │      Repository Layer              │
    │  (Data Access Abstraction)         │
    └────────────┬──────────────────────┘
                 │
    ┌────────────▼──────────────────────┐
    │    Entity Framework Core            │
    │    DbContext (ORM)                  │
    └────────────┬──────────────────────┘
                 │
    ┌────────────▼──────────────────────┐
    │   SQLite Database                   │
    │   (Persistent Storage)             │
    └─────────────────────────────────────┘
```

## Features

- ✅ **RESTful API** with CRUD operations for Users and Posts
- ✅ **Entity Framework Core** for database persistence
- ✅ **Repository Pattern** for data access abstraction
- ✅ **Service Layer** for business logic
- ✅ **FluentValidation** for input validation
- ✅ **AutoMapper** for object mapping
- ✅ **Serilog** for structured logging
- ✅ **Rate Limiting** (100 requests per 15 minutes)
- ✅ **CORS** enabled
- ✅ **Security Headers** (Helmet equivalent)
- ✅ **Swagger/OpenAPI** documentation
- ✅ **Global Exception Handling**
- ✅ **SQLite Database** with automatic migrations

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)

## Getting Started

### 1. Restore Dependencies

```bash
dotnet restore
```

### 2. Run the Application

```bash
dotnet run
```

The API will be available at:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`

### 3. Access Swagger UI

Navigate to `http://localhost:5000/swagger` to view the API documentation and test endpoints.

## Database

The application uses SQLite for local development. The database file (`agentlibrary.db`) will be created automatically on first run.

### Database Migrations

To create a new migration after modifying entity models:

```bash
dotnet ef migrations add MigrationName
dotnet ef database update
```

## API Endpoints

### Health Check
- `GET /health` - Health check endpoint

### Users
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Posts
- `GET /api/posts` - Get all posts (with authors)
- `GET /api/posts/{id}` - Get post by ID
- `POST /api/posts` - Create new post

### Search
- `GET /api/search/users?q={query}` - Search users by name or email

### Statistics
- `GET /api/stats` - Get user and post statistics

## Project Structure

```
AgentLibraryDotNet/
├── Controllers/          # API Controllers
│   ├── UsersController.cs
│   ├── PostsController.cs
│   ├── SearchController.cs
│   └── StatsController.cs
├── Models/              # Domain models and DTOs
│   ├── User.cs
│   ├── Post.cs
│   └── Dtos/
│       ├── UserDto.cs
│       ├── PostDto.cs
│       └── StatsDto.cs
├── Data/                # Database context and repositories
│   ├── ApplicationDbContext.cs
│   └── Repositories/
│       ├── IUserRepository.cs
│       ├── UserRepository.cs
│       ├── IPostRepository.cs
│       └── PostRepository.cs
├── Services/            # Business logic layer
│   ├── IUserService.cs
│   ├── UserService.cs
│   ├── IPostService.cs
│   ├── PostService.cs
│   ├── IStatsService.cs
│   └── StatsService.cs
├── Validators/          # FluentValidation validators
│   ├── CreateUserValidator.cs
│   ├── UpdateUserValidator.cs
│   └── CreatePostValidator.cs
├── Mappings/           # AutoMapper profiles
│   └── MappingProfile.cs
├── Middleware/         # Custom middleware
│   ├── RequestLoggingMiddleware.cs
│   └── ExceptionHandlingMiddleware.cs
├── Program.cs          # Application entry point
└── appsettings.json    # Configuration
```

## Configuration

Edit `appsettings.json` to configure:
- Connection strings
- Logging levels
- Application settings

## Development

### Watch Mode (Hot Reload)

```bash
dotnet watch run
```

### Build

```bash
dotnet build
```

### Production Build

```bash
dotnet publish -c Release -o out
```

## Key Differences from Express.js

| Feature | Express.js | ASP.NET Core |
|---------|-----------|--------------|
| **Data Storage** | In-memory arrays | SQLite database with EF Core |
| **Architecture** | Single file | Layered (Controllers/Services/Repositories) |
| **Validation** | express-validator | FluentValidation |
| **Type Safety** | JavaScript (dynamic) | C# (strongly typed) |
| **Logging** | console.log | Serilog (structured logging) |
| **Error Handling** | Try-catch blocks | Global middleware |
| **Testing** | Jest/Supertest | xUnit (can be added) |

## Performance Improvements

- **Compiled Code**: C# compiled to IL provides better performance
- **Connection Pooling**: Database connections are pooled automatically
- **Indexed Queries**: Database indexes for faster lookups
- **Async/Await**: Non-blocking I/O throughout
- **Multi-threading**: Can handle more concurrent requests

## Security Features

- **Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **Rate Limiting**: 100 requests per IP per 15 minutes
- **Input Validation**: FluentValidation for all inputs
- **SQL Injection Protection**: EF Core parameterized queries
- **CORS**: Configurable cross-origin requests

## Migration Notes

This application maintains API compatibility with the Express.js version, ensuring zero disruption to API consumers. The main improvements are:

1. **Persistent Storage**: Data is now saved to a database
2. **Better Performance**: Compiled code and optimized queries
3. **Type Safety**: Strong typing reduces runtime errors
4. **Enterprise Patterns**: Repository and Service patterns for maintainability
5. **Better Testing**: Easily testable with dependency injection

## Next Steps

To further enhance this application:

1. Add unit and integration tests (xUnit)
2. Add authentication/authorization (JWT)
3. Add caching (Redis)
4. Add API versioning
5. Switch to PostgreSQL or SQL Server for production
6. Add Docker support
7. Add CI/CD pipeline
8. Add monitoring (Application Insights)

```
cd examples/dotnet && ASPNETCORE_ENVIRONMENT=Development DISABLE_RATE_LIMIT=true dotnet watch run
```

## License

MIT
