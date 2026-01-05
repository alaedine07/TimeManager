// backend/TimeManagerApi/Data/SqliteDesignTimeFactory.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace TaskManagementApi.Data
{
    public class SqliteDesignTimeFactory : IDesignTimeDbContextFactory<SqliteTaskManagementDbContext>
    {
        public SqliteTaskManagementDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<SqliteTaskManagementDbContext>();
            optionsBuilder.UseSqlite("Data Source=taskmanagement.db");
            return new SqliteTaskManagementDbContext(optionsBuilder.Options);
        }
    }
}
