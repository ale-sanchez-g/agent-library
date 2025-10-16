using AgentLibraryDotNet.Data.Repositories;
using AgentLibraryDotNet.Models.Dtos;

namespace AgentLibraryDotNet.Services;

public class StatsService : IStatsService
{
    private readonly IUserRepository _userRepository;
    private readonly IPostRepository _postRepository;

    public StatsService(IUserRepository userRepository, IPostRepository postRepository)
    {
        _userRepository = userRepository;
        _postRepository = postRepository;
    }

    public async Task<StatsDto> GetStatsAsync()
    {
        var totalUsers = await _userRepository.GetTotalUsersAsync();
        var totalPosts = await _postRepository.GetTotalPostsAsync();
        var averageAge = await _userRepository.GetAverageAgeAsync();
        var postsPerUser = totalUsers > 0 ? (double)totalPosts / totalUsers : 0;

        return new StatsDto
        {
            TotalUsers = totalUsers,
            TotalPosts = totalPosts,
            AverageAge = averageAge,
            PostsPerUser = postsPerUser
        };
    }
}
