// Repositories/IProjectRepository.cs
using TaskManagementApi.Models;

namespace TaskManagementApi.Repositories
{
    public interface IProjectRepository
    {
        Task<List<Project>> GetAllRootProjectsAsync();
        Task<List<Project>> GetUserRootProjectsAsync(int userId);
        Task<Project?> GetProjectByIdAsync(int id);
        Task<Project> CreateProjectAsync(Project project);
        Task<Project> UpdateProjectAsync(Project project);
        Task<bool> DeleteProjectAsync(int id);
        Task<List<Project>> GetSubProjectsAsync(int parentProjectId);
    }
}
