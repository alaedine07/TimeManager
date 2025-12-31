// backend/TimeManagerApi/Services/IAuthService.cs
using TaskManagementApi.DTOs;
using TaskManagementApi.Models;

namespace TaskManagementApi.Services
{
    public interface IAuthService
    {
        Task<User> RegisterAsync(UserDto userDto, string role = "User");
        Task<string> LoginAsync(UserDto userDto);
    }
}
