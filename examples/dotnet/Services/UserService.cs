using FluentValidation;
using AutoMapper;
using AgentLibraryDotNet.Data.Repositories;
using AgentLibraryDotNet.Models;
using AgentLibraryDotNet.Models.Dtos;

namespace AgentLibraryDotNet.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _repository;
    private readonly IValidator<CreateUserDto> _createValidator;
    private readonly IValidator<UpdateUserDto> _updateValidator;
    private readonly IMapper _mapper;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUserRepository repository,
        IValidator<CreateUserDto> createValidator,
        IValidator<UpdateUserDto> updateValidator,
        IMapper mapper,
        ILogger<UserService> logger)
    {
        _repository = repository;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<UserDto?> GetUserByIdAsync(int id)
    {
        var user = await _repository.GetUserByIdAsync(id);
        return user == null ? null : _mapper.Map<UserDto>(user);
    }

    public async Task<PaginatedUsersDto> GetAllUsersAsync(int page, int limit)
    {
        var users = await _repository.GetAllUsersAsync(page, limit);
        var total = await _repository.GetTotalUsersAsync();
        var pages = (int)Math.Ceiling((double)total / limit);

        return new PaginatedUsersDto
        {
            Users = _mapper.Map<List<UserDto>>(users),
            Pagination = new PaginationDto
            {
                Page = page,
                Limit = limit,
                Total = total,
                Pages = pages
            }
        };
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto dto)
    {
        var validationResult = await _createValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var emailExists = await _repository.EmailExistsAsync(dto.Email);
        if (emailExists)
        {
            throw new InvalidOperationException("Email already exists");
        }

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            Age = dto.Age
        };

        var createdUser = await _repository.CreateUserAsync(user);
        _logger.LogInformation("User created with ID: {UserId}", createdUser.Id);

        return _mapper.Map<UserDto>(createdUser);
    }

    public async Task<UserDto> UpdateUserAsync(int id, UpdateUserDto dto)
    {
        var validationResult = await _updateValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var user = await _repository.GetUserByIdAsync(id);
        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        var emailExists = await _repository.EmailExistsAsync(dto.Email, id);
        if (emailExists)
        {
            throw new InvalidOperationException("Email already exists");
        }

        user.Name = dto.Name;
        user.Email = dto.Email;
        user.Age = dto.Age;

        await _repository.UpdateUserAsync(user);
        _logger.LogInformation("User updated with ID: {UserId}", user.Id);

        return _mapper.Map<UserDto>(user);
    }

    public async Task DeleteUserAsync(int id)
    {
        var user = await _repository.GetUserByIdAsync(id);
        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        await _repository.DeleteUserAsync(id);
        _logger.LogInformation("User deleted with ID: {UserId}", id);
    }

    public async Task<List<UserDto>> SearchUsersAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            throw new ArgumentException("Search query is required");
        }

        var users = await _repository.SearchUsersAsync(query);
        return _mapper.Map<List<UserDto>>(users);
    }
}
