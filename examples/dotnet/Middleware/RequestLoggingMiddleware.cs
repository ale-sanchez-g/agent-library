namespace AgentLibraryDotNet.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var timestamp = DateTime.UtcNow.ToString("o");
        var method = context.Request.Method;
        var path = context.Request.Path;

        _logger.LogInformation("{Timestamp} - {Method} {Path}", timestamp, method, path);

        await _next(context);
    }
}
