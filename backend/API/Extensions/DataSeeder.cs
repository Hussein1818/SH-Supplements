using Core.Domain.Entities.Users;
using Core.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
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

        var dbContext = serviceProvider.GetRequiredService<ApplicationDbContext>();

        string[] roles = { "Customer", "Admin", "Trainer" };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        var admin1Email = configuration["AdminCredentials:Admin1:Email"];
        var admin1UserName = configuration["AdminCredentials:Admin1:UserName"];
        var admin1Password = configuration["AdminCredentials:Admin1:Password"];

        if (!string.IsNullOrEmpty(admin1Email) && !string.IsNullOrEmpty(admin1Password) && !string.IsNullOrEmpty(admin1UserName))
            await CreateOrUpdateAdminAsync(userManager, dbContext, admin1Email, admin1UserName, admin1Password);

        var admin2Email = configuration["AdminCredentials:Admin2:Email"];
        var admin2UserName = configuration["AdminCredentials:Admin2:UserName"];
        var admin2Password = configuration["AdminCredentials:Admin2:Password"];

        if (!string.IsNullOrEmpty(admin2Email) && !string.IsNullOrEmpty(admin2Password) && !string.IsNullOrEmpty(admin2UserName))
            await CreateOrUpdateAdminAsync(userManager, dbContext, admin2Email, admin2UserName, admin2Password);
    }

    private static async Task CreateOrUpdateAdminAsync(UserManager<ApplicationUser> userManager, ApplicationDbContext dbContext, string email, string userName, string password)
    {
        var existingAdmin = await userManager.FindByEmailAsync(email);

        if (existingAdmin == null)
        {
            var admin = new ApplicationUser
            {
                UserName = userName,
                Email = email,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(admin, password);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, "Admin");
                await EnsureUserProfileExists(dbContext, admin.Id);
            }
        }
        else
        {
            bool needUpdate = false;

            if (existingAdmin.UserName != userName)
            {
                existingAdmin.UserName = userName;
                needUpdate = true;
            }

            if (needUpdate)
            {
                await userManager.UpdateAsync(existingAdmin);
            }

            await EnsureUserProfileExists(dbContext, existingAdmin.Id);
        }
    }

    private static async Task EnsureUserProfileExists(ApplicationDbContext dbContext, string userId)
    {
        var profileExists = await dbContext.UserProfiles.AnyAsync(p => p.UserId == userId);
        if (!profileExists)
        {
            var userProfile = new UserProfile
            {
                UserId = userId,
                FirstName = "System",
                LastName = "Admin",
                WalletBalance = 0
            };
            dbContext.UserProfiles.Add(userProfile);
            await dbContext.SaveChangesAsync();
        }
    }
}