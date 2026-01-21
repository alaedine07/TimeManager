// backend/TimeManagerApi/Services/TaskService.cs
using TaskManagementApi.DTOs;
using TaskManagementApi.Models;
using TaskManagementApi.Repositories;

namespace TaskManagementApi.Services
{
    public class TaskService : ITaskService
    {
        private readonly ITaskRepository _repository;
        private readonly IProjectRepository _projectRepository;

        public TaskService(ITaskRepository repository, IProjectRepository projectRepository)
        {
            _repository = repository;
            _projectRepository = projectRepository;
        }

        public async Task<TaskDto?> GetTaskByIdAsync(Guid id)
        {
            var task = await _repository.GetTaskByIdAsync(id);
            return task == null ? null : MapToDto(task);
        }

        public async Task<List<TaskDto>> GetTasksByProjectIdAsync(Guid projectId)
        {
            var tasks = await _repository.GetTasksByProjectIdAsync(projectId);
            return tasks.Select(MapToDto).ToList();
        }

        public async Task<TaskDto> CreateTaskAsync(Guid projectId, CreateTaskDto dto)
        {
            var project = await _projectRepository.GetProjectByIdAsync(projectId);
            if (project == null)
                throw new KeyNotFoundException($"Project with id {projectId} not found");

            var task = new TaskItem
            {
                ProjectId = projectId,
                Name = dto.Name,
                Description = dto.Description,
                Priority = dto.Priority,
                DueDate = dto.DueDate
            };

            var created = await _repository.CreateTaskAsync(task);
            return MapToDto(created);
        }

        public async Task<TaskDto> UpdateTaskAsync(Guid taskId, UpdateTaskDto dto)
        {
            var task = await _repository.GetTaskByIdAsync(taskId);
            if (task == null)
                throw new KeyNotFoundException($"Task with id {taskId} not found");

            if (!string.IsNullOrEmpty(dto.Name))
                task.Name = dto.Name;

            if (!string.IsNullOrEmpty(dto.Description))
                task.Description = dto.Description;

            if (dto.Completed.HasValue)
                task.Completed = dto.Completed.Value;

            if (!string.IsNullOrEmpty(dto.Priority))
                task.Priority = dto.Priority;

            if (dto.DueDate.HasValue)
                task.DueDate = dto.DueDate.Value;

            var updated = await _repository.UpdateTaskAsync(task);
            return MapToDto(updated);
        }

        public async Task<bool> DeleteTaskAsync(Guid id)
        {
            return await _repository.DeleteTaskAsync(id);
        }

        private TaskDto MapToDto(TaskItem task)
        {
            return new TaskDto
            {
                Id = task.Id,
                ProjectId = task.ProjectId,
                Name = task.Name,
                Description = task.Description,
                Completed = task.Completed,
                Priority = task.Priority,
                DueDate = task.DueDate,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt
            };
        }
    }
}
