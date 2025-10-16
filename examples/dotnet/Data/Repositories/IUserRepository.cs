using AgentLibraryDotNet.Models;

namespace AgentLibraryDotNet.Data.Repositories;

public interface IUserRepository
{
    Task<User?> GetUserByIdAsync(int id);
    Task<List<User>> GetAllUsersAsync(int page, int limit);
    Task<User> CreateUserAsync(User user);
    Task UpdateUserAsync(User user);
    Task DeleteUserAsync(int id);
    Task<bool> EmailExistsAsync(string email, int? excludeId = null);
    Task<List<User>> SearchUsersAsync(string query);
    Task<int> GetTotalUsersAsync();
    Task<double> GetAverageAgeAsync();
}
