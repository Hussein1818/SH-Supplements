using Core.Application.Exceptions;
using FluentValidation; 
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

namespace API.Middlewares;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
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
            _logger.LogError(ex, "An unhandled exception occurred.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        var statusCode = (int)HttpStatusCode.InternalServerError;
        var message = "An unexpected error occurred.";
        object? validationErrors = null;

        switch (exception)
        {
            case BadRequestException badRequestException:
                statusCode = (int)HttpStatusCode.BadRequest;
                message = badRequestException.Message;
                break;
            case NotFoundException notFoundException:
                statusCode = (int)HttpStatusCode.NotFound;
                message = notFoundException.Message;
                break;
            case ConflictException conflictException:
                statusCode = (int)HttpStatusCode.Conflict;
                message = conflictException.Message;
                break;
            case UnauthorizedAccessException unauthorizedAccessException:
                statusCode = (int)HttpStatusCode.Unauthorized;
                message = unauthorizedAccessException.Message;
                break;
            case ValidationException validationException:
                statusCode = (int)HttpStatusCode.BadRequest;
                message = "Validation Failed.";
                validationErrors = validationException.Errors.Select(e => new { Field = e.PropertyName, Error = e.ErrorMessage });
                break;
        }

        context.Response.StatusCode = statusCode;

        var result = validationErrors != null
            ? JsonSerializer.Serialize(new { Message = message, Errors = validationErrors })
            : JsonSerializer.Serialize(new { Message = message });

        return context.Response.WriteAsync(result);
    }
}