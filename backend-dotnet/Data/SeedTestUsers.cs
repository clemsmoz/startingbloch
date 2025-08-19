using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Models;

namespace StartingBloch.Backend.Data;

public static class SeedTestUsers
{
    public static async Task EnsureTestUsersAsync(StartingBlochDbContext context)
    {
        // S'assurer que les rôles existent
        var roles = await context.Roles.ToListAsync();
        if (!roles.Any())
        {
            context.Roles.AddRange(
                new Role { Id = 1, Name = "admin", Description = "Administrateur" },
                new Role { Id = 2, Name = "user", Description = "Employé" },
                new Role { Id = 3, Name = "client", Description = "Client" }
            );
            await context.SaveChangesAsync();
        }

        async Task<User> EnsureUserAsync(string username, string email, string role, string password, bool canWrite, int? clientId = null)
        {
            var existing = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (existing != null) return existing;

            var roleEntity = await context.Roles.FirstAsync(r => r.Name.ToLower() == role.ToLower());
            var user = new User
            {
                Username = username,
                Email = email,
                Password = BCrypt.Net.BCrypt.HashPassword(password),
                Role = roleEntity.Name,
                CanRead = true,
                CanWrite = canWrite,
                IsActive = true,
                ClientId = clientId
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            context.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = roleEntity.Id, ClientId = clientId });
            await context.SaveChangesAsync();
            return user;
        }

        // Client Aryballe si pas présent
        var client = await context.Clients.FirstOrDefaultAsync(c => c.NomClient == "Aryballe");
        if (client == null)
        {
            client = new Client { NomClient = "Aryballe", CanRead = true, CanWrite = false };
            context.Clients.Add(client);
            await context.SaveChangesAsync();
        }

        await EnsureUserAsync("admin", "admin@startingbloch.com", "admin", "admin123", true, null);
        await EnsureUserAsync("manager", "manager@startingbloch.com", "user", "manager123", true, client.Id);
        await EnsureUserAsync("client1", "client1@aryballe.com", "client", "client123", false, client.Id);
        await EnsureUserAsync("reader", "reader@startingbloch.com", "user", "reader123", false, null);
    }
}
