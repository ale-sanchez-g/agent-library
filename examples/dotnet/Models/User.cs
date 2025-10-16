namespace AgentLibraryDotNet.Models;

public class User
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public int Age { get; set; }
    
    // Navigation property
    public ICollection<Post> Posts { get; set; } = new List<Post>();
}
