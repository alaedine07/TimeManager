// Controllers/ProjectsController.cs
using Microsoft.AspNetCore.Mvc;
using TaskManagementApi.DTOs;
using TaskManagementApi.Services;
using Microsoft.AspNetCore.Authorization;

namespace TaskManagementApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;
        private readonly ITaskService _taskService;
        private readonly ILogger<ProjectsController> _logger;

        public ProjectsController(IProjectService projectService, ITaskService taskService, ILogger<ProjectsController> logger)
        {
            _projectService = projectService;
            _taskService = taskService;
            _logger = logger;
        }

        // GET: api/projects
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<List<ProjectDto>>> GetAllProjects()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var isAdmin = User.IsInRole("Admin");
            var projects = isAdmin
                ? await _projectService.GetAllRootProjectsAsync()
                : await _projectService.GetUserRootProjectsAsync(userId);

            return Ok(projects);
        }

        // GET: api/projects/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectDto>> GetProjectById(int id)
        {
            var project = await _projectService.GetProjectByIdAsync(id);
            if (project == null)
                return NotFound(new { message = $"Project with id {id} not found" });
            // ensure only owner or admin can access
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized();
            var isAdmin = User.IsInRole("Admin");
            if (project.ownerId != userId && !isAdmin)
                return Forbid();

            return Ok(project);
        }

        // POST: api/projects
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<ProjectDto>> CreateProject([FromBody] CreateProjectDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // extract ownerId from the authenticated user
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var ownerId))
                return Unauthorized();
            dto.ownerId = ownerId;
            var project = await _projectService.CreateProjectAsync(dto);
            return CreatedAtAction(nameof(GetProjectById), new { id = project.Id }, project);
        }

        // PUT: api/projects/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<ProjectDto>> UpdateProject(int id, [FromBody] UpdateProjectDto dto)
        {
            // ensure only owner or admin can update
            var existingProject = await _projectService.GetProjectByIdAsync(id);
            if (existingProject == null)
                return NotFound(new { message = $"Project with id {id} not found" });
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized();
            var isAdmin = User.IsInRole("Admin");
            if (existingProject.ownerId != userId && !isAdmin)
                return Forbid();
            try
            {
                var project = await _projectService.UpdateProjectAsync(id, dto);
                return Ok(project);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = $"Project with id {id} not found" });
            }
        }

        // DELETE: api/projects/{id}
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            // ensure only owner or admin can delete
            var project = await _projectService.GetProjectByIdAsync(id);
            if (project == null)
                return NotFound(new { message = $"Project with id {id} not found" });
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized();
            var isAdmin = User.IsInRole("Admin");
            if (project.ownerId != userId && !isAdmin)
                return Forbid();
            var result = await _projectService.DeleteProjectAsync(id);
            if (!result)
                return NotFound(new { message = $"Project with id {id} not found" });

            return NoContent();
        }

        // GET: api/projects/{id}/subprojects
        [HttpGet("{id}/subprojects")]
        public async Task<ActionResult<List<ProjectDto>>> GetSubProjects(int id)
        {
            var subProjects = await _projectService.GetSubProjectsAsync(id);
            return Ok(subProjects);
        }

        // POST: api/projects/{id}/subprojects
        [Authorize]
        [HttpPost("{id}/subprojects")]
        public async Task<ActionResult<ProjectDto>> CreateSubProject(int id, [FromBody] CreateProjectDto dto)
        {
            var parentProject = await _projectService.GetProjectByIdAsync(id);
            if (parentProject == null)
                return NotFound(new { message = $"Parent project with id {id} not found" });

            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized();
            var isAdmin = User.IsInRole("Admin");
            if (parentProject.ownerId != userId && !isAdmin)
                return Forbid();

            dto.ParentProjectId = id;
            dto.ownerId = parentProject.ownerId;
            Console.WriteLine("dto: " + dto);
            var subProject = await _projectService.CreateProjectAsync(dto);
            return CreatedAtAction(nameof(GetProjectById), new { id = subProject.Id }, subProject);
        }

        // PUT: api/projects/{parentId}/subprojects/{subId}
        [Authorize]
        [HttpPut("{parentId}/subprojects/{subId}")]
        public async Task<ActionResult<ProjectDto>> UpdateSubProject(int parentId, int subId, [FromBody] UpdateProjectDto dto)
        {
            var parentProject = await _projectService.GetProjectByIdAsync(parentId);
            if (parentProject == null)
                return NotFound(new { message = $"Parent project with id {parentId} not found" });

            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized();
            var isAdmin = User.IsInRole("Admin");
            if (parentProject.ownerId != userId && !isAdmin)
                return Forbid();

            try
            {
                var subProject = await _projectService.UpdateProjectAsync(subId, dto);
                return Ok(subProject);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = $"Subproject with id {subId} not found" });
            }
        }

        // DELETE: api/projects/{parentId}/subprojects/{subId}
        [Authorize]
        [HttpDelete("{parentId}/subprojects/{subId}")]
        public async Task<IActionResult> DeleteSubProject(int parentId, int subId)
        {
            var parentProject = await _projectService.GetProjectByIdAsync(parentId);
            if (parentProject == null)
                return NotFound(new { message = $"Parent project with id {parentId} not found" });

            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized();
            var isAdmin = User.IsInRole("Admin");
            if (parentProject.ownerId != userId && !isAdmin)
                return Forbid();

            var result = await _projectService.DeleteProjectAsync(subId);
            if (!result)
                return NotFound(new { message = $"Subproject with id {subId} not found" });

            return NoContent();
        }

        // GET: api/projects/{id}/tasks/{taskId}
        [HttpGet("{id}/tasks/{taskId}")]
        public async Task<ActionResult<TaskDto>> GetTaskById(int id, int taskId)
        {
            var task = await _taskService.GetTaskByIdAsync(taskId);
            if (task == null)
                return NotFound(new { message = $"Task with id {taskId} not found" });

            return Ok(task);
        }

        // Post: api/projects/{id}/tasks
        [Authorize]
        [HttpPost("{id}/tasks")]
        public async Task<ActionResult<TaskDto>> CreateTask(int id, [FromBody] CreateTaskDto dto)
        {
            var project = await _projectService.GetProjectByIdAsync(id);
            if (project == null)
                return NotFound(new { message = $"Project with id {id} not found" });
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized();
            var isAdmin = User.IsInRole("Admin");
            if (project.ownerId != userId && !isAdmin)
                return Forbid();
            var task = await _taskService.CreateTaskAsync(id, dto);
            return CreatedAtAction(nameof(GetTaskById), new { id = id, taskId = task.Id }, task);
        }
    }
}
