// backend/TimeManagerApi/Services/ITimeSessionService.cs

using TaskManagementApi.Models;

public interface ITimeSessionService
{
    Task StartAsync(Guid userId, Guid taskId);
    Task PauseAsync(Guid userId);
    Task<TaskTimeSession?> GetActiveSessionAsync(Guid userId);
    Task<TimeSpan> GetTotalTimeForTaskAsync(Guid userId, Guid taskId);
    Task<TimeSpan>GetTotalTimeForProjectAsync(Guid userId, Guid projectId);
}
