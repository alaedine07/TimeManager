// backend/TimeManagerApi/Services/IProjectService.cs
using TaskManagementApi.DTOs;

namespace TaskManagementApi.Services
{
    public interface IProjectService
    {
        Task<List<ProjectDto>> GetAllRootProjectsAsync();
        Task<List<ProjectDto>> GetUserRootProjectsAsync(int userId);
        Task<ProjectDto?> GetProjectByIdAsync(int id);
        Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto);
        Task<ProjectDto> UpdateProjectAsync(int id, UpdateProjectDto dto);
        Task<bool> DeleteProjectAsync(int id);
        Task<List<ProjectDto>> GetSubProjectsAsync(int parentProjectId);
    }
}
