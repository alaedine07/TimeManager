using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TimeManagerApi.Data;
using TimeManagerApi.Models;

namespace TimeManagerApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Projects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
        {
            return await _context.Projects
                .Include(p => p.SubProjects)
                .Include(p => p.Tasks)
                .ToListAsync();
        }

        // GET: api/Projects/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetProject(int id)
        {
            var project = await _context.Projects
                .Include(p => p.SubProjects)
                .Include(p => p.Tasks)
                .Include(p => p.Parent)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound();
            }

            return project;
        }

        // GET: api/Projects/root - Get only root projects (no parent)
        [HttpGet("root")]
        public async Task<ActionResult<IEnumerable<Project>>> GetRootProjects()
        {
            return await _context.Projects
                .Where(p => p.ParentProjectId == null)
                .Include(p => p.SubProjects)
                .Include(p => p.Tasks)
                .ToListAsync();
        }

        // GET: api/Projects/5/subprojects - Get subprojects of a specific project
        [HttpGet("{id}/subprojects")]
        public async Task<ActionResult<IEnumerable<Project>>> GetSubProjects(int id)
        {
            var parentExists = await _context.Projects.AnyAsync(p => p.Id == id);
            if (!parentExists)
            {
                return NotFound();
            }

            return await _context.Projects
                .Where(p => p.ParentProjectId == id)
                .Include(p => p.SubProjects)
                .Include(p => p.Tasks)
                .ToListAsync();
        }

        // POST: api/Projects
        [HttpPost]
        public async Task<ActionResult<Project>> CreateProject(ProjectDto projectDto)
        {
            // Validate parent project exists if ParentProjectId is provided
            if (projectDto.ParentProjectId.HasValue)
            {
                var parentExists = await _context.Projects
                    .AnyAsync(p => p.Id == projectDto.ParentProjectId.Value);

                if (!parentExists)
                {
                    return BadRequest("Parent project does not exist.");
                }
            }

            var project = new Project
            {
                Name = projectDto.Name,
                Description = projectDto.Description,
                ParentProjectId = projectDto.ParentProjectId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
        }

        // PUT: api/Projects/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(int id, ProjectDto projectDto)
        {
            var project = await _context.Projects.FindAsync(id);

            if (project == null)
            {
                return NotFound();
            }

            // Validate parent project exists if ParentProjectId is provided
            if (projectDto.ParentProjectId.HasValue)
            {
                // Prevent circular reference (project can't be its own parent)
                if (projectDto.ParentProjectId.Value == id)
                {
                    return BadRequest("A project cannot be its own parent.");
                }

                var parentExists = await _context.Projects
                    .AnyAsync(p => p.Id == projectDto.ParentProjectId.Value);

                if (!parentExists)
                {
                    return BadRequest("Parent project does not exist.");
                }
            }

            project.Name = projectDto.Name;
            project.Description = projectDto.Description;
            project.ParentProjectId = projectDto.ParentProjectId;
            project.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProjectExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Projects/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var project = await _context.Projects
                .Include(p => p.SubProjects)
                .Include(p => p.Tasks)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound();
            }

            // Check if project has subprojects or tasks
            if (project.SubProjects.Any() || project.Tasks.Any())
            {
                return BadRequest("Cannot delete project with subprojects or tasks. Delete them first.");
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProjectExists(int id)
        {
            return _context.Projects.Any(e => e.Id == id);
        }
    }

    // DTO for creating/updating projects
    public class ProjectDto
    {
        public string Name { get; set; } = "";
        public string? Description { get; set; }
        public int? ParentProjectId { get; set; }
    }
}
