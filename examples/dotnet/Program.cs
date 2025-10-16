using Microsoft.EntityFrameworkCore;
using FluentValidation;
using AgentLibraryDotNet.Data;
using AgentLibraryDotNet.Data.Repositories;
using AgentLibraryDotNet.Services;
using AgentLibraryDotNet.Validators;
using AgentLibraryDotNet.Middleware;
using AgentLibraryDotNet.Models;
using Serilog;
using AspNetCoreRateLimit;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Rate limiting configuration
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(options =>
{
    options.EnableEndpointRateLimiting = true;
    options.StackBlockedRequests = false;
    options.HttpStatusCode = 429;
    options.RealIpHeader = "X-Real-IP";
    options.GeneralRules = new List<RateLimitRule>
    {
        new RateLimitRule
        {
            Endpoint = "*:/api/*",
            Period = "15m",
            Limit = 100
        }
    };
});

builder.Services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
builder.Services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
builder.Services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();

// Register repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPostRepository, PostRepository>();

// Register services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<IStatsService, StatsService>();

// Register validators
builder.Services.AddValidatorsFromAssemblyContaining<CreateUserValidator>();

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Agent Library API", Version = "v1" });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Security headers middleware
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Referrer-Policy"] = "no-referrer";
    await next();
});

app.UseIpRateLimiting();

app.UseCors("AllowAll");

// Request logging middleware
app.UseMiddleware<RequestLoggingMiddleware>();

// Global exception handling
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new
{
    status = "OK",
    timestamp = DateTime.UtcNow.ToString("o")
}));

// Database initialization and seeding
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        context.Database.Migrate();
        
        // Seed initial data
        if (!context.Users.Any())
        {
            context.Users.AddRange(
                new User { Name = "John Doe", Email = "john@example.com", Age = 30 },
                new User { Name = "Jane Smith", Email = "jane@example.com", Age = 25 },
                new User { Name = "Bob Johnson", Email = "bob@example.com", Age = 35 }
            );
            context.SaveChanges();
            
            var users = context.Users.ToList();
            context.Posts.AddRange(
                new Post
                {
                    Title = "First Post",
                    Content = "This is the first post",
                    AuthorId = users[0].Id,
                    CreatedAt = DateTime.UtcNow
                },
                new Post
                {
                    Title = "Second Post",
                    Content = "This is the second post",
                    AuthorId = users[1].Id,
                    CreatedAt = DateTime.UtcNow
                }
            );
            context.SaveChanges();
        }
        
        Log.Information("Database initialized successfully");
    }
    catch (Exception ex)
    {
        Log.Error(ex, "An error occurred while migrating or seeding the database");
    }
}

Log.Information("Starting Agent Library API on {Environment}", app.Environment.EnvironmentName);
Log.Information("API endpoints available at: /api");
Log.Information("Health check: /health");
Log.Information("Swagger UI: /swagger");

app.Run();

// Make the implicit Program class public for testing
public partial class Program { }
