// Service/ITimeSessionService.cs

using TaskManagementApi.Models;

public interface ITimeSessionService
{
    Task StartAsync(int userId, int taskId);
    Task PauseAsync(int userId);
    Task<TaskTimeSession?> GetActiveSessionAsync(int userId);
}
