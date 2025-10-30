# .NET 8 ASP.NET Core - multi-stage Dockerfile

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
# Render/other PaaS expect an HTTP port; expose 8080
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# Build image
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore first for better caching
COPY backend-dotnet/StartingBloch.Backend.csproj backend-dotnet/
RUN dotnet restore backend-dotnet/StartingBloch.Backend.csproj

# Copy the rest of the sources
COPY backend-dotnet/. backend-dotnet/

# Publish
RUN dotnet publish backend-dotnet/StartingBloch.Backend.csproj -c Release -o /app/publish

# Final image
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "StartingBloch.Backend.dll"]
