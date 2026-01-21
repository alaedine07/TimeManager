// backend/TimeManagerApi/Repositories/ITaskRepository.cs
using TaskManagementApi.Models;

namespace TaskManagementApi.Repositories
{
    public interface ITaskRepository
    {
        Task<TaskItem?> GetTaskByIdAsync(Guid id);
        Task<List<TaskItem>> GetTasksByProjectIdAsync(Guid projectId);
        Task<TaskItem> CreateTaskAsync(TaskItem task);
        Task<TaskItem> UpdateTaskAsync(TaskItem task);
        Task<bool> DeleteTaskAsync(Guid id);
    }
}
