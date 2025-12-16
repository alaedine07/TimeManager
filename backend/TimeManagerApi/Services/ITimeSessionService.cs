// Service/ITimeSessionService.cs

public interface ITimeSessionService
{
    Task StartAsync(int userId, int taskId, int projectId);
    Task PauseAsync(int userId);
}
