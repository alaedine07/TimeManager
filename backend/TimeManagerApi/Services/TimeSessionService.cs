// Services/TimeSessionService.cs
using Microsoft.EntityFrameworkCore;
using TaskManagementApi.Data;
using TaskManagementApi.Models;

public class TimeSessionService : ITimeSessionService
{
    private readonly TaskManagementDbContext _context;

    public TimeSessionService(TaskManagementDbContext context)
    {
        _context = context;
    }

    // Start a session for a task
    public async Task StartAsync(int userId, int taskId, int projectId)
    {
        var now = DateTime.UtcNow;

        // Check if user has an active session
        var activeSession = await _context.TaskTimeSessions
            .FirstOrDefaultAsync(s => s.UserId == userId && s.EndTime == null);

        if (activeSession != null)
        {
            // Same task already running → no-op
            if (activeSession.TaskId == taskId)
                return;

            // Stop previous session
            activeSession.EndTime = now;
        }

        // Start new session
        var session = new TaskTimeSession
        {
            UserId = userId,
            TaskId = taskId,
            ProjectId = projectId,
            StartTime = now
        };

        _context.TaskTimeSessions.Add(session);
        await _context.SaveChangesAsync();
    }

    // Pause currently active session
    public async Task PauseAsync(int userId)
    {
        var activeSession = await _context.TaskTimeSessions
            .FirstOrDefaultAsync(s => s.UserId == userId && s.EndTime == null);

        if (activeSession == null)
            return; // nothing to pause

        activeSession.EndTime = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }
}
