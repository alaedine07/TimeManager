// Repositories/ITaskRepository.cs
using TaskManagementApi.Models;

namespace TaskManagementApi.Repositories
{
    public interface ITaskRepository
    {
        Task<TaskItem?> GetTaskByIdAsync(int id);
        Task<List<TaskItem>> GetTasksByProjectIdAsync(int projectId);
        Task<TaskItem> CreateTaskAsync(TaskItem task);
        Task<TaskItem> UpdateTaskAsync(TaskItem task);
        Task<bool> DeleteTaskAsync(int id);
    }
}
