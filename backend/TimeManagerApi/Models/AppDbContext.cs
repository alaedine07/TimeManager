using Microsoft.EntityFrameworkCore;
using TimeManagerApi.Models;

namespace TimeManagerApi.Data {
  public class AppDbContext : DbContext {
    public AppDbContext(DbContextOptions<AppDbContext> opts) : base(opts) {}
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<TaskItem> TaskItems => Set<TaskItem>();
    public DbSet<TimeEntry> TimeEntries => Set<TimeEntry>();
  }
}
