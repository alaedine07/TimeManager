// DTOs/UpdateProjectDto.cs
namespace TaskManagementApi.DTOs
{
    public class UpdateProjectDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Category { get; set; }
        public bool? Completed { get; set; }
    }
}
