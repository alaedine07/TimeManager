// DTOs/TaskDto.cs
using System;

namespace TaskManagementApi.DTOs
{
    public class TaskDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool Completed { get; set; }
        public string? Priority { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
