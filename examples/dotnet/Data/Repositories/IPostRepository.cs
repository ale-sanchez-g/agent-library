using AgentLibraryDotNet.Models;

namespace AgentLibraryDotNet.Data.Repositories;

public interface IPostRepository
{
    Task<Post?> GetPostByIdAsync(int id);
    Task<List<Post>> GetAllPostsAsync();
    Task<Post> CreatePostAsync(Post post);
    Task<int> GetTotalPostsAsync();
}
