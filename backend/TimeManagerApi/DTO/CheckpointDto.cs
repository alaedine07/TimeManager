// backend/TimeManagerApi/Models/DTOs/CheckpointDto.cs
using System;

namespace TaskManagementApi.Models.DTOs
{
    public class CreateCheckpointDto
    {
        public string Name { get; set; } = string.Empty;
        public bool Completed { get; set; } = false;
    }

    public class UpdateCheckpointDto
    {
        public string? Name { get; set; }
        public bool? Completed { get; set; }
    }

    public class CheckpointDto
    {
        public Guid Id { get; set; }
        public Guid TaskId { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool Completed { get; set; } = false;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
