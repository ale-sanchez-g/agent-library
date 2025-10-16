using FluentValidation;
using AgentLibraryDotNet.Models.Dtos;

namespace AgentLibraryDotNet.Validators;

public class CreatePostValidator : AbstractValidator<CreatePostDto>
{
    public CreatePostValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(500).WithMessage("Title cannot exceed 500 characters");

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Content is required");

        RuleFor(x => x.AuthorId)
            .GreaterThan(0).WithMessage("Author ID must be a number");
    }
}
