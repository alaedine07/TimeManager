// Service/ITimeSessionService.cs

public interface ITimeSessionService
{
    Task StartAsync(int userId, int taskId);
    Task PauseAsync(int userId);
}
