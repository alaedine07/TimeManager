// DTOs/UpdateTaskDto.cs
namespace TaskManagementApi.DTOs
{
    public class UpdateTaskDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool? Completed { get; set; }
        public string? Priority { get; set; }
        public DateTime? DueDate { get; set; }
        public bool? IsInTodoList { get; set; }
    }
}
