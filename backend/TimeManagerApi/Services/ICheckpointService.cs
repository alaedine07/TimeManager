// backend/TimeManagerApi/Services/ICheckpointService.cs
using TaskManagementApi.Models.DTOs;

namespace TaskManagementApi.Services
{
    public interface ICheckpointService
    {
        Task<IEnumerable<CheckpointDto>> GetCheckpointsAsync(Guid projectId, Guid taskId);
        Task<CheckpointDto?> GetCheckpointAsync(Guid projectId, Guid taskId, Guid id);
        Task<CheckpointDto> CreateCheckpointAsync(Guid projectId, Guid taskId, CreateCheckpointDto createDto);
        Task UpdateCheckpointAsync(Guid projectId, Guid taskId, Guid id, UpdateCheckpointDto updateDto);
        Task DeleteCheckpointAsync(Guid projectId, Guid taskId, Guid id);
    }
}
