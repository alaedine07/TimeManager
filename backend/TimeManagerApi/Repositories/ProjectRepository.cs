using Microsoft.EntityFrameworkCore;
using TaskManagementApi.Data;
using TaskManagementApi.Models;

namespace TaskManagementApi.Repositories
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly TaskManagementDbContext _context;

        public ProjectRepository(TaskManagementDbContext context)
        {
            _context = context;
        }

        public async Task<List<Project>> GetAllRootProjectsAsync()
        {
            return await _context.Projects
                .Where(p => p.ParentProjectId == null)
                .Include(p => p.Tasks)
                .Include(p => p.SubProjects)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Project>> GetUserRootProjectsAsync(int userId)
        {
            return await _context.Projects
                .Where(p => p.ParentProjectId == null && p.OwnerId == userId)
                .Include(p => p.Tasks)
                .Include(p => p.SubProjects)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<Project?> GetProjectByIdAsync(int id)
        {
            return await _context.Projects
                .Include(p => p.Tasks)
                .Include(p => p.SubProjects)
                .ThenInclude(sp => sp.Tasks)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Project> CreateProjectAsync(Project project)
        {
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();
            return project;
        }

        public async Task<Project> UpdateProjectAsync(Project project)
        {
            project.UpdatedAt = DateTime.UtcNow;
            _context.Projects.Update(project);
            await _context.SaveChangesAsync();
            return project;
        }

        public async Task<bool> DeleteProjectAsync(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null)
                return false;

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Project>> GetSubProjectsAsync(int parentProjectId)
        {
            return await _context.Projects
                .Where(p => p.ParentProjectId == parentProjectId)
                .Include(p => p.Tasks)
                .ToListAsync();
        }
    }
}
