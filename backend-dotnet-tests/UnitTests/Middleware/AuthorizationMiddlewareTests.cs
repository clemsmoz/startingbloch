using FluentAssertions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using StartingBloch.Backend.Middleware;
using System.Security.Claims;

namespace StartingBloch.Backend.Tests.UnitTests.Middleware;

public class AuthorizationMiddlewareTests
{
    private readonly Mock<RequestDelegate> _mockNext;
    private readonly AuthorizationMiddleware _middleware;

    public AuthorizationMiddlewareTests()
    {
        _mockNext = new Mock<RequestDelegate>();
        _middleware = new AuthorizationMiddleware(_mockNext.Object);
    }

    [Fact]
    public async Task InvokeAsync_WithAnonymousEndpoint_Should_CallNext()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.SetEndpoint(new Endpoint(null, new EndpointMetadataCollection(new AllowAnonymousAttribute()), null));

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        _mockNext.Verify(x => x(context), Times.Once);
    }

    [Fact]
    public async Task InvokeAsync_WithAuthorizedUserAndCorrectRole_Should_CallNext()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.User = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "1"),
            new Claim(ClaimTypes.Role, "Admin")
        }, "test"));

        var authorizeAttribute = new AuthorizeAttribute { Roles = "Admin" };
        context.SetEndpoint(new Endpoint(null, new EndpointMetadataCollection(authorizeAttribute), null));

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        _mockNext.Verify(x => x(context), Times.Once);
    }

    [Fact]
    public async Task InvokeAsync_WithUnauthenticatedUser_Should_Return401()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.User = new ClaimsPrincipal(); // Utilisateur non authentifié

        var authorizeAttribute = new AuthorizeAttribute();
        context.SetEndpoint(new Endpoint(null, new EndpointMetadataCollection(authorizeAttribute), null));

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be(401);
        _mockNext.Verify(x => x(context), Times.Never);
    }

    [Fact]
    public async Task InvokeAsync_WithWrongRole_Should_Return403()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.User = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "1"),
            new Claim(ClaimTypes.Role, "User")
        }, "test"));

        var authorizeAttribute = new AuthorizeAttribute { Roles = "Admin" };
        context.SetEndpoint(new Endpoint(null, new EndpointMetadataCollection(authorizeAttribute), null));

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be(403);
        _mockNext.Verify(x => x(context), Times.Never);
    }

    [Fact]
    public async Task InvokeAsync_WithMultipleRolesAndUserHasOne_Should_CallNext()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.User = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "1"),
            new Claim(ClaimTypes.Role, "Employee")
        }, "test"));

        var authorizeAttribute = new AuthorizeAttribute { Roles = "Admin,Employee,Manager" };
        context.SetEndpoint(new Endpoint(null, new EndpointMetadataCollection(authorizeAttribute), null));

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        _mockNext.Verify(x => x(context), Times.Once);
    }

    [Fact]
    public async Task InvokeAsync_WithNoEndpoint_Should_CallNext()
    {
        // Arrange
        var context = new DefaultHttpContext();
        // Pas d'endpoint défini

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        _mockNext.Verify(x => x(context), Times.Once);
    }

    [Fact]
    public async Task InvokeAsync_WithInactiveUser_Should_Return403()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.User = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "1"),
            new Claim(ClaimTypes.Role, "Admin"),
            new Claim("IsActive", "false")
        }, "test"));

        var authorizeAttribute = new AuthorizeAttribute();
        context.SetEndpoint(new Endpoint(null, new EndpointMetadataCollection(authorizeAttribute), null));

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be(403);
        _mockNext.Verify(x => x(context), Times.Never);
    }
}
