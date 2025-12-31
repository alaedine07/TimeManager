// backend/TimeManagerApi/Services/ITimeSessionService.cs

using TaskManagementApi.Models;

public interface ITimeSessionService
{
    Task StartAsync(int userId, int taskId);
    Task PauseAsync(int userId);
    Task<TaskTimeSession?> GetActiveSessionAsync(int userId);
    Task<TimeSpan> GetTotalTimeForTaskAsync(int userId, int taskId);
    Task<TimeSpan>GetTotalTimeForProjectAsync(int userId, int projectId);
}
