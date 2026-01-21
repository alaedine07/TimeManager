// backend/TimeManagerApi/Services/IProjectService.cs
using TaskManagementApi.DTOs;

namespace TaskManagementApi.Services
{
    public interface IProjectService
    {
        Task<List<ProjectDto>> GetAllRootProjectsAsync();
        Task<List<ProjectDto>> GetUserRootProjectsAsync(Guid userId);
        Task<ProjectDto?> GetProjectByIdAsync(Guid id);
        Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto);
        Task<ProjectDto> UpdateProjectAsync(Guid id, UpdateProjectDto dto);
        Task<bool> DeleteProjectAsync(Guid id);
        Task<List<ProjectDto>> GetSubProjectsAsync(Guid parentProjectId);
    }
}
