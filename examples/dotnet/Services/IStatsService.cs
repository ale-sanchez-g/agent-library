using AgentLibraryDotNet.Models.Dtos;

namespace AgentLibraryDotNet.Services;

public interface IStatsService
{
    Task<StatsDto> GetStatsAsync();
}
