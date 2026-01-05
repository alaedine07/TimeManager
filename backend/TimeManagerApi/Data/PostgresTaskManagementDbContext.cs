// backend/TimeManagerApi/Data/PostgresTaskManagementDbContext.cs
using Microsoft.EntityFrameworkCore;

namespace TaskManagementApi.Data
{
    public class PostgresTaskManagementDbContext : TaskManagementDbContext
    {
        public PostgresTaskManagementDbContext(DbContextOptions<PostgresTaskManagementDbContext> options)
            : base(options) { }
    }
}
