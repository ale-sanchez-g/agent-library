namespace AgentLibraryDotNet.Models;

public class Post
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Content { get; set; }
    public int AuthorId { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Navigation property
    public User? Author { get; set; }
}
