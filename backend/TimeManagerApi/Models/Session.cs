namespace TimeManagerApi.Models {
  public class Session {
    public int Id { get; set; }
    public int TaskItemId { get; set; }
    // Duration in seconds (optional)
    public int? Duration { get; set; }
    public TaskItem? TaskItem { get; set; }

    public DateTime StartAt { get; set; }
    public DateTime? EndAt { get; set; }
  }
}
