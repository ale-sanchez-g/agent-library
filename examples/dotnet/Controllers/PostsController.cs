using Microsoft.AspNetCore.Mvc;
using AgentLibraryDotNet.Services;
using AgentLibraryDotNet.Models.Dtos;

namespace AgentLibraryDotNet.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly IPostService _service;
    private readonly ILogger<PostsController> _logger;

    public PostsController(IPostService service, ILogger<PostsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetPosts()
    {
        var posts = await _service.GetAllPostsAsync();
        return Ok(posts);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPost(int id)
    {
        var post = await _service.GetPostByIdAsync(id);
        if (post == null)
            return NotFound(new { error = "Post not found" });
        
        return Ok(post);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostDto dto)
    {
        var post = await _service.CreatePostAsync(dto);
        return CreatedAtAction(nameof(GetPost), new { id = post.Id }, post);
    }
}
