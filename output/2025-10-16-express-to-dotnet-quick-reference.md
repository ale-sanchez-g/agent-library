# Express to .NET Migration - Quick Reference Guide

## 🚀 Quick Start

### 1. Create Project
```bash
dotnet new webapi -n AgentLibraryDotNet -f net8.0
cd AgentLibraryDotNet
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
dotnet add package FluentValidation
dotnet add package FluentValidation.DependencyInjectionExtensions
dotnet add package Serilog
dotnet add package AutoMapper
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
```

### 2. Core Entity Models (Priority 1)

**Models/User.cs**
```csharp
public class User
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public int Age { get; set; }
    public ICollection<Post> Posts { get; set; } = new List<Post>();
}
```

**Models/Post.cs**
```csharp
public class Post
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public int AuthorId { get; set; }
    public DateTime CreatedAt { get; set; }
    public User Author { get; set; }
}
```

### 3. DbContext Configuration (Priority 1)

**Data/ApplicationDbContext.cs**
```csharp
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Post> Posts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
        
        modelBuilder.Entity<Post>()
            .HasOne(p => p.Author)
            .WithMany(u => u.Posts)
            .HasForeignKey(p => p.AuthorId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

### 4. DTOs (Priority 1)

**Models/Dtos/UserDto.cs**
```csharp
public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public int Age { get; set; }
}

public class CreateUserDto
{
    public string Name { get; set; }
    public string Email { get; set; }
    public int Age { get; set; }
}

public class UpdateUserDto : CreateUserDto { }
```

### 5. Validators (Priority 1)

**Validators/CreateUserValidator.cs**
```csharp
public class CreateUserValidator : AbstractValidator<CreateUserDto>
{
    public CreateUserValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(255);

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress();

        RuleFor(x => x.Age)
            .InclusiveBetween(1, 120).WithMessage("Age must be between 1 and 120");
    }
}
```

### 6. Repository Pattern (Priority 2)

**Data/Repositories/IUserRepository.cs**
```csharp
public interface IUserRepository
{
    Task<User> GetUserByIdAsync(int id);
    Task<List<User>> GetAllUsersAsync(int page, int limit);
    Task<User> CreateUserAsync(User user);
    Task UpdateUserAsync(User user);
    Task DeleteUserAsync(int id);
    Task<bool> EmailExistsAsync(string email, int? excludeId = null);
    Task<List<User>> SearchUsersAsync(string query);
    Task<int> GetTotalUsersAsync();
}
```

**Data/Repositories/UserRepository.cs**
```csharp
public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<User> GetUserByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<List<User>> GetAllUsersAsync(int page, int limit)
    {
        return await _context.Users
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<User> CreateUserAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<bool> EmailExistsAsync(string email, int? excludeId = null)
    {
        return await _context.Users
            .AnyAsync(u => u.Email == email && (!excludeId.HasValue || u.Id != excludeId));
    }

    public async Task<List<User>> SearchUsersAsync(string query)
    {
        return await _context.Users
            .Where(u => u.Name.Contains(query) || u.Email.Contains(query))
            .ToListAsync();
    }

    public async Task<int> GetTotalUsersAsync()
    {
        return await _context.Users.CountAsync();
    }

    // ... other methods
}
```

### 7. Service Layer (Priority 2)

**Services/IUserService.cs**
```csharp
public interface IUserService
{
    Task<UserDto> GetUserByIdAsync(int id);
    Task<(List<UserDto> users, int total, int pages)> GetAllUsersAsync(int page, int limit);
    Task<UserDto> CreateUserAsync(CreateUserDto dto);
    Task<UserDto> UpdateUserAsync(int id, UpdateUserDto dto);
    Task DeleteUserAsync(int id);
    Task<List<UserDto>> SearchUsersAsync(string query);
}
```

**Services/UserService.cs**
```csharp
public class UserService : IUserService
{
    private readonly IUserRepository _repository;
    private readonly IValidator<CreateUserDto> _validator;
    private readonly IMapper _mapper;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUserRepository repository,
        IValidator<CreateUserDto> validator,
        IMapper mapper,
        ILogger<UserService> logger)
    {
        _repository = repository;
        _validator = validator;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto dto)
    {
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var emailExists = await _repository.EmailExistsAsync(dto.Email);
        if (emailExists)
        {
            throw new InvalidOperationException("Email already exists");
        }

        var user = new User { Name = dto.Name, Email = dto.Email, Age = dto.Age };
        await _repository.CreateUserAsync(user);
        
        _logger.LogInformation($"User created: {user.Id}");
        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> GetUserByIdAsync(int id)
    {
        var user = await _repository.GetUserByIdAsync(id);
        return user == null ? null : _mapper.Map<UserDto>(user);
    }

    // ... other methods
}
```

### 8. Controllers (Priority 3)

**Controllers/UsersController.cs**
```csharp
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _service;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService service, ILogger<UsersController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int limit = 10)
    {
        var (users, total, pages) = await _service.GetAllUsersAsync(page, limit);
        return Ok(new
        {
            users,
            pagination = new { page, limit, total, pages }
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _service.GetUserByIdAsync(id);
        if (user == null)
            return NotFound(new { error = "User not found" });
        return Ok(user);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        try
        {
            var user = await _service.CreateUserAsync(dto);
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { errors = ex.Errors });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    // ... other endpoints
}
```

### 9. Program.cs Configuration (Priority 1)

```csharp
var builder = WebApplicationBuilder.CreateBuilder(args);

// Add services
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPostRepository, PostRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPostService, PostService>();

builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);
builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

// Database migration
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
}

app.Run();
```

### 10. appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=app.db"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

## 📊 Implementation Order

1. **Day 1**: Models + DbContext + Program.cs setup
2. **Day 1-2**: Validators + DTOs
3. **Day 2-3**: Repositories
4. **Day 3**: Services
5. **Day 4**: Controllers
6. **Day 5**: Tests
7. **Day 5-6**: Integration & optimization

## 🧪 Testing Template

```csharp
public class UserServiceTests
{
    private readonly Mock<IUserRepository> _mockRepository;
    private readonly UserService _service;

    public UserServiceTests()
    {
        _mockRepository = new Mock<IUserRepository>();
        _service = new UserService(_mockRepository.Object, new Mock<IValidator<CreateUserDto>>().Object, 
            new Mock<IMapper>().Object, new Mock<ILogger<UserService>>().Object);
    }

    [Fact]
    public async Task GetUserByIdAsync_ValidId_ReturnsUser()
    {
        // Arrange
        var userId = 1;
        _mockRepository.Setup(r => r.GetUserByIdAsync(userId))
            .ReturnsAsync(new User { Id = 1, Name = "Test", Email = "test@example.com", Age = 30 });

        // Act
        var result = await _service.GetUserByIdAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
    }
}
```

## 🔄 Migration Path

Express App → ASP.NET Core App (Parallel)
- Deploy .NET app on port 5000
- Keep Express on port 3000
- Use routing to switch traffic gradually
- Monitor and validate
- Complete cutover after 1 week

## 📚 Key Resources

- [ASP.NET Core Documentation](https://docs.microsoft.com/en-us/aspnet/core/)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
- [FluentValidation](https://fluentvalidation.net/)
- [AutoMapper](https://automapper.org/)

---

**Start with Priority 1 items (Models, DbContext, Program.cs setup) - these are your foundation!**
