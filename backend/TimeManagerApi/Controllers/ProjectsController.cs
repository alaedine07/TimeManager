// Controllers/ProjectsController.cs
using Microsoft.AspNetCore.Mvc;
using TaskManagementApi.DTOs;
using TaskManagementApi.Services;

namespace TaskManagementApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;
        private readonly ITaskService _taskService;

        public ProjectsController(IProjectService projectService, ITaskService taskService)
        {
            _projectService = projectService;
            _taskService = taskService;
        }

        // GET: api/projects
        [HttpGet]
        public async Task<ActionResult<List<ProjectDto>>> GetAllProjects()
        {
            var projects = await _projectService.GetAllRootProjectsAsync();
            return Ok(projects);
        }

        // GET: api/projects/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectDto>> GetProjectById(int id)
        {
            var project = await _projectService.GetProjectByIdAsync(id);
            if (project == null)
                return NotFound(new { message = $"Project with id {id} not found" });

            return Ok(project);
        }

        // POST: api/projects
        [HttpPost]
        public async Task<ActionResult<ProjectDto>> CreateProject([FromBody] CreateProjectDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var project = await _projectService.CreateProjectAsync(dto);
            return CreatedAtAction(nameof(GetProjectById), new { id = project.Id }, project);
        }

        // PUT: api/projects/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<ProjectDto>> UpdateProject(int id, [FromBody] UpdateProjectDto dto)
        {
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
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
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
        [HttpPost("{id}/subprojects")]
        public async Task<ActionResult<ProjectDto>> CreateSubProject(int id, [FromBody] CreateProjectDto dto)
        {
            dto.ParentProjectId = id;
            var subProject = await _projectService.CreateProjectAsync(dto);
            return CreatedAtAction(nameof(GetProjectById), new { id = subProject.Id }, subProject);
        }

        // POST: api/projects/{id}/tasks
        [HttpPost("{id}/tasks")]
        public async Task<ActionResult<TaskDto>> CreateTask(int id, [FromBody] CreateTaskDto dto)
        {
            try
            {
                var task = await _taskService.CreateTaskAsync(id, dto);
                return CreatedAtAction(nameof(GetTaskById), new { projectId = id, taskId = task.Id }, task);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = $"Project with id {id} not found" });
            }
        }

        // PUT: api/projects/{projectId}/tasks/{taskId}
        [HttpPut("{projectId}/tasks/{taskId}")]
        public async Task<ActionResult<TaskDto>> UpdateTask(int projectId, int taskId, [FromBody] UpdateTaskDto dto)
        {
            try
            {
                var task = await _taskService.UpdateTaskAsync(taskId, dto);
                return Ok(task);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = $"Task with id {taskId} not found" });
            }
        }

        // DELETE: api/projects/{projectId}/tasks/{taskId}
        [HttpDelete("{projectId}/tasks/{taskId}")]
        public async Task<IActionResult> DeleteTask(int projectId, int taskId)
        {
            var result = await _taskService.DeleteTaskAsync(taskId);
            if (!result)
                return NotFound(new { message = $"Task with id {taskId} not found" });

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
    }
}
