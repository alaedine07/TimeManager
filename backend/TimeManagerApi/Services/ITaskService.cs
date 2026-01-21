// backend/TimeManagerApi/Services/ITaskService.cs
using TaskManagementApi.DTOs;

namespace TaskManagementApi.Services
{
    public interface ITaskService
    {
        Task<TaskDto?> GetTaskByIdAsync(Guid id);
        Task<List<TaskDto>> GetTasksByProjectIdAsync(Guid projectId);
        Task<TaskDto> CreateTaskAsync(Guid projectId, CreateTaskDto dto);
        Task<TaskDto> UpdateTaskAsync(Guid taskId, UpdateTaskDto dto);
        Task<bool> DeleteTaskAsync(Guid id);
    }
}
