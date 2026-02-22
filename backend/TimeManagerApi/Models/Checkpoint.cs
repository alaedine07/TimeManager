// bacjend/TimeManagerApi/Models/Checkpoint.cs
using System;

namespace TaskManagementApi.Models
{
    public class Checkpoint
    {
        public Guid Id { get; set; }
        public Guid TaskId { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool Completed { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public TaskItem? Task { get; set; }
    }
}
