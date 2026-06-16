using API.Hubs;
using API.Services;
using Core.Application.Features.Auth.Commands;
using Core.Application.Features.Catalog.Commands;
using Core.Application.Features.System.Commands;
using Core.Application.Features.Users.Commands;
using Core.Application.Interfaces.Repositories;
using Core.Application.Interfaces.Services;
using Core.Application.Settings;
using Core.Domain.Entities.Users;
using Core.Infrastructure.Persistence;
using Core.Infrastructure.Persistence.Repositories;
using Core.Infrastructure.Services;
using Hangfire;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SH-Supplements API", Version = "v1" });

    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your token in the text input below.\n\nExample: \"Bearer 12345abcdef\""
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Hangfire Configuration
builder.Services.AddHangfire(configuration => configuration
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection"))); 

builder.Services.AddHangfireServer();

// --- SignalR & Real-Time Notifications DI ---
builder.Services.AddSignalR();
builder.Services.AddScoped<IStockNotificationService, StockNotificationService>();
builder.Services.AddScoped<IFlashSaleNotificationService, FlashSaleNotificationService>();
builder.Services.AddScoped<IDosageNotificationService, DosageNotificationService>();

// ==========================================
// Database & Identity Dependency Injection
// ==========================================

// 1. Register ApplicationDbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Register Identity Services
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// 3. Register Repositories & Unit of Work 
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
// Register MediatR and tell it to look for handlers in the Application layer
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(RegisterUserCommand).Assembly));
// ==========================================

// 4. Register Token Service
builder.Services.AddScoped<ITokenService, TokenService>();

// Register Email Service
builder.Services.AddScoped<IEmailService, EmailService>();


// Financials & Payment Gateway DI 

// 1. Bind Paymob settings from appsettings.json
builder.Services.Configure<PaymobSettings>(builder.Configuration.GetSection("PaymobSettings"));

// 2. Register Payment Service with an injected HttpClient
builder.Services.AddHttpClient<IPaymentService, PaymobPaymentService>();

// ==========================================
// JWT Authentication Setup
// ==========================================
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Set to true in Production
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero // To expire the token exactly at the specified time
    };
});

builder.Services.Configure<Core.Application.Settings.OrderSettings>(builder.Configuration.GetSection("OrderSettings"));
builder.Services.Configure<Core.Application.Settings.LoyaltySettings>(builder.Configuration.GetSection("LoyaltySettings"));
builder.Services.Configure<Core.Application.Settings.AffiliateSettings>(builder.Configuration.GetSection("AffiliateSettings"));
builder.Services.Configure<Core.Application.Settings.ClearanceSettings>(builder.Configuration.GetSection("ClearanceSettings"));


var app = builder.Build();

// Seed Data: Create Roles if they don't exist
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    string[] roles = { "Customer", "Admin" };

    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }
}
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseHangfireDashboard("/hangfire");

app.MapHub<StockHub>("/hubs/stock");

RecurringJob.AddOrUpdate<IMediator>(
    "Process-Daily-Subscriptions",
    mediator => mediator.Send(new ProcessDueSubscriptionsCommand(), CancellationToken.None),
    Cron.Daily);

// Check for restocked products every hour
RecurringJob.AddOrUpdate<IMediator>(
    "Process-Stock-Notifications",
    mediator => mediator.Send(new ProcessStockNotificationsCommand(), CancellationToken.None),
    Cron.Hourly);

RecurringJob.AddOrUpdate<IMediator>(
    "Process-Dynamic-Clearance",
    mediator => mediator.Send(new ProcessDynamicClearanceCommand(), CancellationToken.None),
    Cron.Daily);

RecurringJob.AddOrUpdate<IMediator>(
    "Process-Dosage-Reminders",
    mediator => mediator.Send(new ProcessDosageRemindersCommand(), CancellationToken.None),
    "*/15 * * * *"); 

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();