// DTOs/ProjectDto.cs
using System;
using System.Collections.Generic;

namespace TaskManagementApi.DTOs
{
    public class ProjectDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Category { get; set; }
        public int? ParentProjectId { get; set; }
        public bool Completed { get; set; }
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<ProjectDto> SubProjects { get; set; } = new List<ProjectDto>();
        public List<TaskDto> Tasks { get; set; } = new List<TaskDto>();
    }
}
