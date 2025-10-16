using AgentLibraryDotNet.Models.Dtos;

namespace AgentLibraryDotNet.Services;

public interface IPostService
{
    Task<PostDto?> GetPostByIdAsync(int id);
    Task<List<PostDto>> GetAllPostsAsync();
    Task<PostDto> CreatePostAsync(CreatePostDto dto);
}
