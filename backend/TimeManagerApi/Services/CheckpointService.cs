// backend/TimeManagerApi/Services/CheckpointService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskManagementApi.Data;
using TaskManagementApi.Models;
using TaskManagementApi.Models.DTOs;
using TaskManagementApi.Repositories;

namespace TaskManagementApi.Services
{
    public class CheckpointService : ICheckpointService
    {
        private readonly ICheckpointRepository _checkpointRepository;
        private readonly TaskManagementDbContext _context; // Used for task validation

        public CheckpointService(ICheckpointRepository checkpointRepository, TaskManagementDbContext context)
        {
            _checkpointRepository = checkpointRepository;
            _context = context;
        }

        public async Task<IEnumerable<CheckpointDto>> GetCheckpointsAsync(Guid projectId, Guid taskId)
        {
            var task = await ValidateTaskAsync(projectId, taskId);
            if (task == null)
            {
                throw new KeyNotFoundException("Task not found.");
            }

            var checkpoints = await _checkpointRepository.GetCheckpointsByTaskIdAsync(taskId);

            return checkpoints.Select(c => MapToDto(c));
        }

        public async Task<CheckpointDto?> GetCheckpointAsync(Guid projectId, Guid taskId, Guid id)
        {
            var task = await ValidateTaskAsync(projectId, taskId);
            if (task == null)
            {
                throw new KeyNotFoundException("Task not found.");
            }

            var checkpoint = await _checkpointRepository.GetCheckpointByIdAsync(id);
            if (checkpoint == null || checkpoint.TaskId != taskId)
            {
                return null;
            }

            return MapToDto(checkpoint);
        }

        public async Task<CheckpointDto> CreateCheckpointAsync(Guid projectId, Guid taskId, CreateCheckpointDto createDto)
        {
            var task = await ValidateTaskAsync(projectId, taskId);
            if (task == null)
            {
                throw new KeyNotFoundException("Task not found.");
            }

            var checkpoint = new Checkpoint
            {
                Id = Guid.NewGuid(),
                TaskId = taskId,
                Name = createDto.Name,
                Completed = createDto.Completed
            };

            var addedCheckpoint = await _checkpointRepository.AddCheckpointAsync(checkpoint);

            return MapToDto(addedCheckpoint);
        }

        public async Task UpdateCheckpointAsync(Guid projectId, Guid taskId, Guid id, UpdateCheckpointDto updateDto)
        {
            var task = await ValidateTaskAsync(projectId, taskId);
            if (task == null)
            {
                throw new KeyNotFoundException("Task not found.");
            }

            var checkpoint = await _checkpointRepository.GetCheckpointByIdAsync(id);
            if (checkpoint == null || checkpoint.TaskId != taskId)
            {
                throw new KeyNotFoundException("Checkpoint not found.");
            }

            if (updateDto.Name != null)
            {
                checkpoint.Name = updateDto.Name;
            }

            if (updateDto.Completed.HasValue)
            {
                checkpoint.Completed = updateDto.Completed.Value;
            }

            checkpoint.UpdatedAt = DateTime.UtcNow;

            await _checkpointRepository.UpdateCheckpointAsync(checkpoint);
        }

        public async Task DeleteCheckpointAsync(Guid projectId, Guid taskId, Guid id)
        {
            var task = await ValidateTaskAsync(projectId, taskId);
            if (task == null)
            {
                throw new KeyNotFoundException("Task not found.");
            }

            var checkpoint = await _checkpointRepository.GetCheckpointByIdAsync(id);
            if (checkpoint == null || checkpoint.TaskId != taskId)
            {
                throw new KeyNotFoundException("Checkpoint not found.");
            }

            await _checkpointRepository.DeleteCheckpointAsync(id);
        }

        private async Task<TaskItem?> ValidateTaskAsync(Guid projectId, Guid taskId)
        {
            return await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == taskId && t.ProjectId == projectId);
        }

        private CheckpointDto MapToDto(Checkpoint checkpoint)
        {
            return new CheckpointDto
            {
                Id = checkpoint.Id,
                TaskId = checkpoint.TaskId,
                Name = checkpoint.Name,
                Completed = checkpoint.Completed,
                CreatedAt = checkpoint.CreatedAt,
                UpdatedAt = checkpoint.UpdatedAt
            };
        }
    }
}
