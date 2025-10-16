using AutoMapper;
using AgentLibraryDotNet.Models;
using AgentLibraryDotNet.Models.Dtos;

namespace AgentLibraryDotNet.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<User, UserDto>();
        CreateMap<CreateUserDto, User>();
        CreateMap<UpdateUserDto, User>();

        // Post mappings
        CreateMap<Post, PostDto>();
        CreateMap<CreatePostDto, Post>();
    }
}
