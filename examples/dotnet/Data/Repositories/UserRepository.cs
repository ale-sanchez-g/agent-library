using Microsoft.EntityFrameworkCore;
using AgentLibraryDotNet.Models;

namespace AgentLibraryDotNet.Data.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<List<User>> GetAllUsersAsync(int page, int limit)
    {
        return await _context.Users
            .OrderBy(u => u.Id)
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<User> CreateUserAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task UpdateUserAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteUserAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user != null)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> EmailExistsAsync(string email, int? excludeId = null)
    {
        return await _context.Users
            .AnyAsync(u => u.Email == email && (!excludeId.HasValue || u.Id != excludeId));
    }

    public async Task<List<User>> SearchUsersAsync(string query)
    {
        return await _context.Users
            .Where(u => u.Name.Contains(query) || u.Email.Contains(query))
            .ToListAsync();
    }

    public async Task<int> GetTotalUsersAsync()
    {
        return await _context.Users.CountAsync();
    }

    public async Task<double> GetAverageAgeAsync()
    {
        if (!await _context.Users.AnyAsync())
            return 0;
        
        return await _context.Users.AverageAsync(u => u.Age);
    }
}
