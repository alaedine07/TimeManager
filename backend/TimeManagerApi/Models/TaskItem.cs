// backend/TimeManagerApi/Models/TaskItem.cs
using System;

namespace TaskManagementApi.Models
{
    public class TaskItem
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool Completed { get; set; } = false;
        public string? Priority { get; set; } // "low", "medium", "high"
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public ICollection<TaskTimeSession> TimeSessions { get; set; } = new List<TaskTimeSession>();
        public ICollection<Checkpoint> Checkpoints { get; set; } = new List<Checkpoint>();
        public Project? Project { get; set; }
    }
}
