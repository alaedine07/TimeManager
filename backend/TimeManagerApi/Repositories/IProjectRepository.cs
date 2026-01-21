// backend/TimeManagerApi/Repositories/IProjectRepository.cs
using TaskManagementApi.Models;

namespace TaskManagementApi.Repositories
{
    public interface IProjectRepository
    {
        Task<List<Project>> GetAllRootProjectsAsync();
        Task<List<Project>> GetUserRootProjectsAsync(Guid userId);
        Task<Project?> GetProjectByIdAsync(Guid id);
        Task<Project> CreateProjectAsync(Project project);
        Task<Project> UpdateProjectAsync(Project project);
        Task<bool> DeleteProjectAsync(Guid id);
        Task<List<Project>> GetSubProjectsAsync(Guid parentProjectId);
    }
}
