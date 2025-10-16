using System.Net;
using System.Text.Json;
using FluentValidation;

namespace AgentLibraryDotNet.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        int statusCode;
        object responseBody;

        switch (exception)
        {
            case ValidationException validationEx:
                statusCode = (int)HttpStatusCode.BadRequest;
                responseBody = new
                {
                    errors = validationEx.Errors.Select(e => new
                    {
                        propertyName = e.PropertyName,
                        errorMessage = e.ErrorMessage
                    })
                };
                break;
            case KeyNotFoundException:
                statusCode = (int)HttpStatusCode.NotFound;
                responseBody = new { error = exception.Message };
                break;
            case InvalidOperationException:
                statusCode = (int)HttpStatusCode.Conflict;
                responseBody = new { error = exception.Message };
                break;
            case ArgumentException:
                statusCode = (int)HttpStatusCode.BadRequest;
                responseBody = new { error = exception.Message };
                break;
            default:
                statusCode = (int)HttpStatusCode.InternalServerError;
                responseBody = new { error = "Internal server error" };
                break;
        }

        context.Response.StatusCode = statusCode;
        return context.Response.WriteAsync(JsonSerializer.Serialize(responseBody));
    }
}
