using FluentValidation;
using AutoMapper;
using AgentLibraryDotNet.Data.Repositories;
using AgentLibraryDotNet.Models;
using AgentLibraryDotNet.Models.Dtos;

namespace AgentLibraryDotNet.Services;

public class PostService : IPostService
{
    private readonly IPostRepository _postRepository;
    private readonly IUserRepository _userRepository;
    private readonly IValidator<CreatePostDto> _validator;
    private readonly IMapper _mapper;
    private readonly ILogger<PostService> _logger;

    public PostService(
        IPostRepository postRepository,
        IUserRepository userRepository,
        IValidator<CreatePostDto> validator,
        IMapper mapper,
        ILogger<PostService> logger)
    {
        _postRepository = postRepository;
        _userRepository = userRepository;
        _validator = validator;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<PostDto?> GetPostByIdAsync(int id)
    {
        var post = await _postRepository.GetPostByIdAsync(id);
        return post == null ? null : _mapper.Map<PostDto>(post);
    }

    public async Task<List<PostDto>> GetAllPostsAsync()
    {
        var posts = await _postRepository.GetAllPostsAsync();
        return _mapper.Map<List<PostDto>>(posts);
    }

    public async Task<PostDto> CreatePostAsync(CreatePostDto dto)
    {
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var authorExists = await _userRepository.GetUserByIdAsync(dto.AuthorId);
        if (authorExists == null)
        {
            throw new ArgumentException("Author not found");
        }

        var post = new Post
        {
            Title = dto.Title,
            Content = dto.Content,
            AuthorId = dto.AuthorId,
            CreatedAt = DateTime.UtcNow
        };

        var createdPost = await _postRepository.CreatePostAsync(post);
        _logger.LogInformation("Post created with ID: {PostId}", createdPost.Id);

        return _mapper.Map<PostDto>(createdPost);
    }
}
