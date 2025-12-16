// controller/TimeSessionController.cs

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
        public async Task<IActionResult> StartTimeSession(int taskId)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();
            int userId = int.Parse(userIdClaim.Value);
            await _timeSessionService.StartAsync(userId, taskId);
            return Ok();
        }

        [HttpPost("stop")]
        public async Task<IActionResult> StopTimeSession()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();
            int userId = int.Parse(userIdClaim.Value);
            await _timeSessionService.PauseAsync(userId);
            return Ok();
        }
    }
}
