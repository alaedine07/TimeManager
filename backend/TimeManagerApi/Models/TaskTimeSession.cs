// model/TaskTimeSession.cs
using System;

namespace TaskManagementApi.Models
{
    public class TaskTimeSession
    {
        public int Id { get; set; }

        public int TaskId { get; set; }
        public int UserId { get; set; }

        public DateTime StartTime { get; set; }
        // note: endTime is null meaning the session is still ongoing
        public DateTime? EndTime { get; set; }

        // Navigation property
        public TaskItem? Task { get; set; }
        public User? User { get; set; }
    }
}
