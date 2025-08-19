using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Middleware;

namespace StartingBloch.Backend.Controllers;

/// <summary>
/// Expose les rôles disponibles (valeurs canoniques) depuis la table Roles.
/// Utilisé par l'UI d'administration pour peupler la liste des rôles.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[AdminOnly]
public class RolesController : ControllerBase
{
    private readonly StartingBlochDbContext _context;

    public RolesController(StartingBlochDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Retourne la liste des rôles (admin/user/client) avec descriptions.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<RoleDto>>>> GetRoles()
    {
        var roles = await _context.Roles
            .OrderBy(r => r.Id)
            .Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return Ok(new ApiResponse<List<RoleDto>>
        {
            Success = true,
            Data = roles,
            Message = $"{roles.Count} rôle(s) disponible(s)"
        });
    }
}
