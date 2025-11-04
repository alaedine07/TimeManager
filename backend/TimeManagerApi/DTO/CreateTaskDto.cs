// DTOs/CreateTaskDto.cs
namespace TaskManagementApi.DTOs
{
    public class CreateTaskDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Priority { get; set; }
        public DateTime? DueDate { get; set; }
    }
}
