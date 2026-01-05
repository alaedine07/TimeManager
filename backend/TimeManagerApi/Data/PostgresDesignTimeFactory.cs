using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace TaskManagementApi.Data
{
    public class PostgresDesignTimeFactory : IDesignTimeDbContextFactory<PostgresTaskManagementDbContext>
    {
        public PostgresTaskManagementDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<PostgresTaskManagementDbContext>();
            var conn = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING")
                       ?? throw new InvalidOperationException("DB_CONNECTION_STRING not set");
            optionsBuilder.UseNpgsql(conn);
            return new PostgresTaskManagementDbContext(optionsBuilder.Options);
        }
    }
}
