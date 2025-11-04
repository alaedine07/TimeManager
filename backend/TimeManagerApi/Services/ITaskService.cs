// Services/ITaskService.cs
using TaskManagementApi.DTOs;

namespace TaskManagementApi.Services
{
    public interface ITaskService
    {
        Task<TaskDto?> GetTaskByIdAsync(int id);
        Task<List<TaskDto>> GetTasksByProjectIdAsync(int projectId);
        Task<TaskDto> CreateTaskAsync(int projectId, CreateTaskDto dto);
        Task<TaskDto> UpdateTaskAsync(int taskId, UpdateTaskDto dto);
        Task<bool> DeleteTaskAsync(int id);
    }
}
