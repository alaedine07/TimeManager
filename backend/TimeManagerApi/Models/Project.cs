using System.ComponentModel.DataAnnotations.Schema;

namespace TimeManagerApi.Models
{
    public class Project
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public int? ParentProjectId { get; set; }
        public int totalTime { get; set; } = 0;
        public string? Description { get; set; }

        // Self-referencing relationship
        [ForeignKey(nameof(ParentProjectId))]
        public Project? Parent { get; set; }

        // Navigation properties
        public ICollection<Project> SubProjects { get; set; } = new List<Project>();
        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
