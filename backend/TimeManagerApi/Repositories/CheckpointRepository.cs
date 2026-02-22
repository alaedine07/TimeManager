// backend/TimeManagerApi/Repositories/CheckpointRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskManagementApi.Data;
using TaskManagementApi.Models;

namespace TaskManagementApi.Repositories
{
    public class CheckpointRepository : ICheckpointRepository
    {
        private readonly TaskManagementDbContext _context;

        public CheckpointRepository(TaskManagementDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Checkpoint>> GetCheckpointsByTaskIdAsync(Guid taskId)
        {
            return await _context.Checkpoints
                .Where(c => c.TaskId == taskId)
                .ToListAsync();
        }

        public async Task<Checkpoint?> GetCheckpointByIdAsync(Guid id)
        {
            return await _context.Checkpoints.FindAsync(id);
        }

        public async Task<Checkpoint> AddCheckpointAsync(Checkpoint checkpoint)
        {
            _context.Checkpoints.Add(checkpoint);
            await _context.SaveChangesAsync();
            return checkpoint;
        }

        public async Task UpdateCheckpointAsync(Checkpoint checkpoint)
        {
            _context.Entry(checkpoint).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteCheckpointAsync(Guid id)
        {
            var checkpoint = await _context.Checkpoints.FindAsync(id);
            if (checkpoint != null)
            {
                _context.Checkpoints.Remove(checkpoint);
                await _context.SaveChangesAsync();
            }
        }
    }
}
