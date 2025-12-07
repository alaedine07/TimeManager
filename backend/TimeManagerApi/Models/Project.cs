// Models/Project.cs
using System;
using System.Collections.Generic;

namespace TaskManagementApi.Models
{
    public class Project
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Category { get; set; }
        public int? ParentProjectId { get; set; }
        public bool Completed { get; set; } = false;
        public int ownerId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Project? ParentProject { get; set; }
        public ICollection<Project> SubProjects { get; set; } = new List<Project>();
        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
        public User? Owner { get; set; }
    }
}
