// DTOs/CreateProjectDto.cs
namespace TaskManagementApi.DTOs
{
    public class CreateProjectDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int ownerId { get; set; }
        public string? Category { get; set; }
        public int? ParentProjectId { get; set; }
    }
}
