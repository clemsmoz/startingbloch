using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace StartingBloch.Backend.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<StartingBlochDbContext>
{
    // Fallback explicite (contient le mot de passe – usage dev uniquement)
    private const string FallbackConnection =
        "Host=ep-purple-voice-a2j51ltt-pooler.eu-central-1.aws.neon.tech;Port=5432;Database=neondb;Username=neondb_owner;Password=npg_kCf9qNlYTEd3;SSL Mode=Require;Trust Server Certificate=true;Search Path=public";

    public StartingBlochDbContext CreateDbContext(string[] args)
    {
        var conn =
            Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? Environment.GetEnvironmentVariable("DB_CONNECTION")
            ?? FallbackConnection;

        var options = new DbContextOptionsBuilder<StartingBlochDbContext>()
            .UseNpgsql(conn)
            .Options;

        return new StartingBlochDbContext(options);
    }
} 