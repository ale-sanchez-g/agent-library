using Microsoft.EntityFrameworkCore;
using AgentLibraryDotNet.Models;

namespace AgentLibraryDotNet.Data.Repositories;

public class PostRepository : IPostRepository
{
    private readonly ApplicationDbContext _context;

    public PostRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Post?> GetPostByIdAsync(int id)
    {
        return await _context.Posts
            .Include(p => p.Author)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<List<Post>> GetAllPostsAsync()
    {
        return await _context.Posts
            .Include(p => p.Author)
            .OrderBy(p => p.Id)
            .ToListAsync();
    }

    public async Task<Post> CreatePostAsync(Post post)
    {
        _context.Posts.Add(post);
        await _context.SaveChangesAsync();
        
        // Load author after save
        await _context.Entry(post).Reference(p => p.Author).LoadAsync();
        return post;
    }

    public async Task<int> GetTotalPostsAsync()
    {
        return await _context.Posts.CountAsync();
    }
}
