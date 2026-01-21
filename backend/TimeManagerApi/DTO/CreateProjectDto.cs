// DTOs/CreateProjectDto.cs
namespace TaskManagementApi.DTOs
{
    public class CreateProjectDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid ownerId { get; set; }
        public string? Category { get; set; }
        public Guid? ParentProjectId { get; set; }
        public string DefaultTabOnOpen { get; set; } = "tasks";
    }
}
