// backend/TimeManagerApi/Controllers/TimeSessionController.cs

namespace TimeManagerApi.Controllers
{
    using Microsoft.AspNetCore.Mvc;

    [ApiController]
    [Route("api/[controller]")]
    public class TimeSessionController : ControllerBase
    {
        private readonly ITimeSessionService _timeSessionService;

        public TimeSessionController(ITimeSessionService timeSessionService)
        {
            _timeSessionService = timeSessionService;
        }

        [HttpPost("start/{taskId}")]
        public async Task<IActionResult> StartTimeSession(Guid taskId)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();
            Guid userId = Guid.Parse(userIdClaim.Value);
            await _timeSessionService.StartAsync(userId, taskId);
            return Ok();
        }

        [HttpPost("stop")]
        public async Task<IActionResult> StopTimeSession()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();
            Guid userId = Guid.Parse(userIdClaim.Value);
            await _timeSessionService.PauseAsync(userId);
            return Ok();
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveSession()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();
            Guid userId = Guid.Parse(userIdClaim.Value);
            var session = await _timeSessionService.GetActiveSessionAsync(userId);
            return Ok(session);
        }

        // get total time worked for a task
        [HttpGet("task/{taskId}/total-time")]
        public async Task<IActionResult> GetTotalTimeForTask(Guid taskId)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();
            Guid userId = Guid.Parse(userIdClaim.Value);
            var totalTime = await _timeSessionService.GetTotalTimeForTaskAsync(userId, taskId);
            return Ok(totalTime);
        }

        // Get total time worked for a project
        [HttpGet("project/{projectId}/total-time")]
        public async Task<IActionResult> GetTotalTimeForProject(Guid projectId)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();
            Guid userId = Guid.Parse(userIdClaim.Value);
            var totalTime = await _timeSessionService.GetTotalTimeForProjectAsync(userId, projectId);
            return Ok(totalTime);
        }

        // start task with a specific duration (e.g. 25 minutes)
        [HttpPost("start-with-duration/{taskId}")]
        public async Task<IActionResult> StartTimeSessionWithDuration(Guid taskId, [FromQuery] int durationMinutes)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();
            Guid userId = Guid.Parse(userIdClaim.Value);
            await _timeSessionService.StartTaskWithDurationAsync(userId, taskId, durationMinutes);
            return Ok();
        }
    }
}
