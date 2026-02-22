// backend/TimeManagerApi/Controllers/CheckpointsController.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using TaskManagementApi.Models.DTOs;
using TaskManagementApi.Services;

namespace TaskManagementApi.Controllers
{
    [ApiController]
    [Route("api/projects/{projectId}/tasks/{taskId}/checkpoints")]
    public class CheckpointsController : ControllerBase
    {
        private readonly ICheckpointService _checkpointService;

        public CheckpointsController(ICheckpointService checkpointService)
        {
            _checkpointService = checkpointService;
        }

        // GET: api/projects/{projectId}/tasks/{taskId}/checkpoints
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CheckpointDto>>> GetCheckpoints(Guid projectId, Guid taskId)
        {
            try
            {
                var checkpoints = await _checkpointService.GetCheckpointsAsync(projectId, taskId);
                Console.WriteLine($"Fetched {checkpoints.Count()} checkpoints for project {projectId} and task {taskId}");
                return Ok(checkpoints);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // GET: api/projects/{projectId}/tasks/{taskId}/checkpoints/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<CheckpointDto>> GetCheckpoint(Guid projectId, Guid taskId, Guid id)
        {
            try
            {
                var checkpoint = await _checkpointService.GetCheckpointAsync(projectId, taskId, id);
                if (checkpoint == null)
                {
                    return NotFound("Checkpoint not found.");
                }
                return Ok(checkpoint);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // POST: api/projects/{projectId}/tasks/{taskId}/checkpoints
        [HttpPost]
        public async Task<ActionResult<CheckpointDto>> CreateCheckpoint(Guid projectId, Guid taskId, CreateCheckpointDto createDto)
        {
            try
            {
                var dto = await _checkpointService.CreateCheckpointAsync(projectId, taskId, createDto);
                return CreatedAtAction(nameof(GetCheckpoint), new { projectId, taskId, id = dto.Id }, dto);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // PUT: api/projects/{projectId}/tasks/{taskId}/checkpoints/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCheckpoint(Guid projectId, Guid taskId, Guid id, UpdateCheckpointDto updateDto)
        {
            try
            {
                await _checkpointService.UpdateCheckpointAsync(projectId, taskId, id, updateDto);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // DELETE: api/projects/{projectId}/tasks/{taskId}/checkpoints/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCheckpoint(Guid projectId, Guid taskId, Guid id)
        {
            try
            {
                await _checkpointService.DeleteCheckpointAsync(projectId, taskId, id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
