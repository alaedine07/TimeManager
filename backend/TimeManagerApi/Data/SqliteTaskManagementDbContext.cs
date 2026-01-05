// backend/TimeManagerApi/Data/SqliteTaskManagementDbContext.cs
using Microsoft.EntityFrameworkCore;

namespace TaskManagementApi.Data
{
    public class SqliteTaskManagementDbContext : TaskManagementDbContext
    {
        public SqliteTaskManagementDbContext(DbContextOptions<SqliteTaskManagementDbContext> options)
            : base(options) { }
    }
}
