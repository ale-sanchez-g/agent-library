using AgentLibraryDotNet.Models.Dtos;

namespace AgentLibraryDotNet.Services;

public interface IUserService
{
    Task<UserDto?> GetUserByIdAsync(int id);
    Task<PaginatedUsersDto> GetAllUsersAsync(int page, int limit);
    Task<UserDto> CreateUserAsync(CreateUserDto dto);
    Task<UserDto> UpdateUserAsync(int id, UpdateUserDto dto);
    Task DeleteUserAsync(int id);
    Task<List<UserDto>> SearchUsersAsync(string query);
}
