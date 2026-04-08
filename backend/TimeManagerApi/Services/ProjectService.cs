// backend/TimeManagerApi/Services/ProjectService.cs
using TaskManagementApi.DTOs;
using TaskManagementApi.Models;
using TaskManagementApi.Repositories;

namespace TaskManagementApi.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepository _repository;

        public ProjectService(IProjectRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<ProjectDto>> GetAllRootProjectsAsync()
        {
            var projects = await _repository.GetAllRootProjectsAsync();
            return projects.Select(MapToDto).ToList();
        }

        public async Task<List<ProjectDto>> GetUserRootProjectsAsync(Guid userId)
        {
            var projects = await _repository.GetUserRootProjectsAsync(userId);
            return projects.Select(MapToDto).ToList();
        }

        public async Task<ProjectDto?> GetProjectByIdAsync(Guid id)
        {
            var project = await _repository.GetProjectByIdAsync(id);
            return project == null ? null : MapToDto(project);
        }

        public async Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto)
        {
            var project = new Project
            {
                Name = dto.Name,
                Description = dto.Description,
                Category = dto.Category,
                ParentProjectId = dto.ParentProjectId,
                ownerId = dto.ownerId,
                DefaultTabOnOpen = dto.DefaultTabOnOpen
            };

            var created = await _repository.CreateProjectAsync(project);
            return MapToDto(created);
        }

        public async Task<ProjectDto> UpdateProjectAsync(Guid id, UpdateProjectDto dto)
        {
            var project = await _repository.GetProjectByIdAsync(id);
            if (project == null)
                throw new KeyNotFoundException($"Project with id {id} not found");

            if (!string.IsNullOrEmpty(dto.Name))
                project.Name = dto.Name;

            if (!string.IsNullOrEmpty(dto.Description))
                project.Description = dto.Description;

            if (!string.IsNullOrEmpty(dto.Category))
                project.Category = dto.Category;

            if (dto.Completed.HasValue)
                project.Completed = dto.Completed.Value;

            if (!string.IsNullOrEmpty(dto.DefaultTabOnOpen))
                project.DefaultTabOnOpen = dto.DefaultTabOnOpen;

            var updated = await _repository.UpdateProjectAsync(project);
            return MapToDto(updated);
        }

        public async Task<bool> DeleteProjectAsync(Guid id)
        {
            return await _repository.DeleteProjectAsync(id);
        }

        public async Task<List<ProjectDto>> GetSubProjectsAsync(Guid parentProjectId)
        {
            var subProjects = await _repository.GetSubProjectsAsync(parentProjectId);
            return subProjects.Select(MapToDto).ToList();
        }

        private ProjectDto MapToDto(Project project)
        {
            return new ProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                Category = project.Category,
                ownerId = project.ownerId,
                ParentProjectId = project.ParentProjectId,
                Completed = project.Completed,
                TotalTasks = project.Tasks?.Count ?? 0,
                CompletedTasks = project.Tasks?.Count(t => t.Completed) ?? 0,
                CreatedAt = project.CreatedAt,
                UpdatedAt = project.UpdatedAt,
                SubProjects = project.SubProjects?.Select(MapToDto).ToList() ?? new List<ProjectDto>(),
                DefaultTabOnOpen = project.DefaultTabOnOpen,
                Tasks = project.Tasks?.Select(t => new TaskDto
                {
                    Id = t.Id,
                    ProjectId = t.ProjectId,
                    Name = t.Name,
                    Description = t.Description,
                    Completed = t.Completed,
                    Priority = t.Priority,
                    DueDate = t.DueDate,
                    IsInTodoList = t.IsInTodoList,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt
                }).ToList() ?? new List<TaskDto>()
            };
        }
    }
}
