// backend/TimeManagerApi/Models/TaskTimeSession.cs
using System;

namespace TaskManagementApi.Models
{
    public class TaskTimeSession
    {
        public Guid Id { get; set; }

        public Guid TaskId { get; set; }
        public Guid UserId { get; set; }
        public Guid ProjectId { get; set; }

        public DateTime StartTime { get; set; }
        // note: endTime is null meaning the session is still ongoing
        public DateTime? EndTime { get; set; }

        // Navigation property
        public TaskItem? Task { get; set; }
        public User? User { get; set; }
        public Project? Project { get; set; }
    }
}
