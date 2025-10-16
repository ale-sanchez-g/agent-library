using Microsoft.AspNetCore.Mvc;
using AgentLibraryDotNet.Services;

namespace AgentLibraryDotNet.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly IStatsService _service;
    private readonly ILogger<StatsController> _logger;

    public StatsController(IStatsService service, ILogger<StatsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _service.GetStatsAsync();
        return Ok(stats);
    }
}
