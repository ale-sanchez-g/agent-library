using Microsoft.AspNetCore.Mvc;
using AgentLibraryDotNet.Services;

namespace AgentLibraryDotNet.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<SearchController> _logger;

    public SearchController(IUserService userService, ILogger<SearchController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    [HttpGet("users")]
    public async Task<IActionResult> SearchUsers([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest(new { error = "Search query is required" });

        var results = await _userService.SearchUsersAsync(q);
        return Ok(results);
    }
}
