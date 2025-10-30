using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using StartingBloch.Backend.Middleware;
using System.Text.Json;

namespace StartingBloch.Backend.Tests.UnitTests.Middleware;

public class ExceptionHandlingMiddlewareTests
{
    private readonly Mock<RequestDelegate> _mockNext;
    private readonly Mock<ILogger<ExceptionHandlingMiddleware>> _mockLogger;
    private readonly ExceptionHandlingMiddleware _middleware;

    public ExceptionHandlingMiddlewareTests()
    {
        _mockNext = new Mock<RequestDelegate>();
        _mockLogger = new Mock<ILogger<ExceptionHandlingMiddleware>>();
        _middleware = new ExceptionHandlingMiddleware(_mockNext.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task InvokeAsync_WithNoException_Should_CallNext()
    {
        // Arrange
        var context = new DefaultHttpContext();
        
        _mockNext.Setup(x => x(context)).Returns(Task.CompletedTask);

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        _mockNext.Verify(x => x(context), Times.Once);
    }

    [Fact]
    public async Task InvokeAsync_WithArgumentException_Should_ReturnBadRequest()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        
        var exception = new ArgumentException("Invalid argument");
        _mockNext.Setup(x => x(context)).ThrowsAsync(exception);

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be(400);
        context.Response.ContentType.Should().Be("application/json");
        
        // Vérifier le logging
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Invalid argument")),
                exception,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task InvokeAsync_WithUnauthorizedAccessException_Should_ReturnUnauthorized()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        
        var exception = new UnauthorizedAccessException("Access denied");
        _mockNext.Setup(x => x(context)).ThrowsAsync(exception);

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be(401);
        context.Response.ContentType.Should().Be("application/json");
    }

    [Fact]
    public async Task InvokeAsync_WithKeyNotFoundException_Should_ReturnNotFound()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        
        var exception = new KeyNotFoundException("Resource not found");
        _mockNext.Setup(x => x(context)).ThrowsAsync(exception);

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be(404);
        context.Response.ContentType.Should().Be("application/json");
    }

    [Fact]
    public async Task InvokeAsync_WithInvalidOperationException_Should_ReturnConflict()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        
        var exception = new InvalidOperationException("Operation not allowed");
        _mockNext.Setup(x => x(context)).ThrowsAsync(exception);

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be(409);
        context.Response.ContentType.Should().Be("application/json");
    }

    [Fact]
    public async Task InvokeAsync_WithGenericException_Should_ReturnInternalServerError()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        
        var exception = new Exception("Something went wrong");
        _mockNext.Setup(x => x(context)).ThrowsAsync(exception);

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be(500);
        context.Response.ContentType.Should().Be("application/json");
        
        // Vérifier le logging d'erreur
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Something went wrong")),
                exception,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task InvokeAsync_WithException_Should_ReturnCorrectErrorResponse()
    {
        // Arrange
        var context = new DefaultHttpContext();
        var responseStream = new MemoryStream();
        context.Response.Body = responseStream;
        
        var exception = new ArgumentException("Test error message");
        _mockNext.Setup(x => x(context)).ThrowsAsync(exception);

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        responseStream.Seek(0, SeekOrigin.Begin);
        var responseBody = await new StreamReader(responseStream).ReadToEndAsync();
        
        var errorResponse = JsonSerializer.Deserialize<object>(responseBody);
        errorResponse.Should().NotBeNull();
        
        responseBody.Should().Contain("Test error message");
        responseBody.Should().Contain("error");
    }

    [Fact]
    public async Task InvokeAsync_WithTimeoutException_Should_ReturnRequestTimeout()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        
        var exception = new TimeoutException("Request timeout");
        _mockNext.Setup(x => x(context)).ThrowsAsync(exception);

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be(408);
        context.Response.ContentType.Should().Be("application/json");
    }

    [Fact]
    public async Task InvokeAsync_WithNotImplementedException_Should_ReturnNotImplemented()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        
        var exception = new NotImplementedException("Feature not implemented");
        _mockNext.Setup(x => x(context)).ThrowsAsync(exception);

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be(501);
        context.Response.ContentType.Should().Be("application/json");
    }
}
