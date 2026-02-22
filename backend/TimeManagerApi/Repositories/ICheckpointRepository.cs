// backend/TimeManagerApi/Repositories/ICheckpointRepository.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskManagementApi.Models;

namespace TaskManagementApi.Repositories
{
    public interface ICheckpointRepository
    {
        Task<IEnumerable<Checkpoint>> GetCheckpointsByTaskIdAsync(Guid taskId);
        Task<Checkpoint?> GetCheckpointByIdAsync(Guid id);
        Task<Checkpoint> AddCheckpointAsync(Checkpoint checkpoint);
        Task UpdateCheckpointAsync(Checkpoint checkpoint);
        Task DeleteCheckpointAsync(Guid id);
    }
}
