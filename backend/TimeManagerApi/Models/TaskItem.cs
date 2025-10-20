namespace TimeManagerApi.Models {

    public enum TaskStatus
    {
        Running,
        Paused,
        Finished
    }

    public class TaskItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string? Description { get; set; }
        public TaskStatus Status { get; set; } = TaskStatus.Paused;
        public int TotalTimes { get; set; }

        public int ProjectId { get; set; }
        public Project? Project { get; set; }
        public List<Session> Sessions { get; set; } = new();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
