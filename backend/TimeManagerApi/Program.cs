// backend/TimeManagerApi/Program.cs
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using TaskManagementApi.Data;
using TaskManagementApi.Repositories;
using TaskManagementApi.Services;
using Hangfire;
using Hangfire.Storage.SQLite;
using Hangfire.PostgreSql;

var builder = WebApplication.CreateBuilder(args);

// add logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Add services to the container
builder.Services.AddControllers();

// get connection string from config or environment variable
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
?? Environment.GetEnvironmentVariable("DB_CONNECTION_STRING")
?? throw new InvalidOperationException("Database connection string is not configured.");

// add hangfire
builder.Services.AddHangfire(config =>
{
    config.UseSimpleAssemblyNameTypeSerializer()
          .UseRecommendedSerializerSettings();

    if (builder.Environment.IsDevelopment())
    {
        Console.WriteLine("Hangfire using SQLite");
        config.UseSQLiteStorage("Data Source=hangfire.db");
    }
    else
    {
        Console.WriteLine("Hangfire using PostgreSQL");
        config.UsePostgreSqlStorage(connectionString);
    }
});

// Add DbContext
if (builder.Environment.IsDevelopment())
{
    Console.WriteLine("Using SQLite");
    builder.Services.AddDbContext<TaskManagementDbContext, SqliteTaskManagementDbContext>(options =>
    {
        options.UseSqlite("Data Source=taskmanagement.db");
        options.EnableSensitiveDataLogging();
    });
}
else
{
    Console.WriteLine("Using PostgreSQL");
    builder.Services.AddDbContext<TaskManagementDbContext, PostgresTaskManagementDbContext>(options =>
    {
        Console.WriteLine("Using PostgreSQL");
        options.UseNpgsql(connectionString);
    });
}

// Add Repositories
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<ITaskRepository, TaskRepository>();

// Add Services
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITimeSessionService, TimeSessionService>();
builder.Services.AddHangfireServer();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins(
            "http://localhost:4200",
            "http://localhost:5173",
            "http://217.182.64.83",
            "https://taskmanagerframework.alaspace.me",
            "http://taskmanagerframework.alaspace.me")
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// add Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Issuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is not configured.")))
    };
});

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter your JWT token like this: Bearer {your token}"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Apply migrations and create database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<TaskManagementDbContext>();
    context.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAngularApp");

app.UseAuthentication();

app.UseAuthorization();

app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = [new HangfireAuthorizationFilter()]
});

app.MapControllers();

app.Run();
