using Core.Domain.Entities.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading.Tasks;

namespace API.Extensions;

public static class DataSeeder
{
    public static async Task SeedRolesAndAdminsAsync(IServiceProvider serviceProvider, IConfiguration configuration)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        string[] roles = { "Customer", "Admin", "Trainer" };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        var admin1Email = configuration["AdminCredentials:Admin1:Email"];
        var admin1Password = configuration["AdminCredentials:Admin1:Password"];
        if (!string.IsNullOrEmpty(admin1Email) && !string.IsNullOrEmpty(admin1Password))
            await CreateAdminIfNotExists(userManager, admin1Email, admin1Password);

        var admin2Email = configuration["AdminCredentials:Admin2:Email"];
        var admin2Password = configuration["AdminCredentials:Admin2:Password"];
        if (!string.IsNullOrEmpty(admin2Email) && !string.IsNullOrEmpty(admin2Password))
            await CreateAdminIfNotExists(userManager, admin2Email, admin2Password);
    }

    private static async Task CreateAdminIfNotExists(UserManager<ApplicationUser> userManager, string email, string password)
    {
        if (await userManager.FindByEmailAsync(email) == null)
        {
            var admin = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(admin, password);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, "Admin");
            }
        }
    }
}