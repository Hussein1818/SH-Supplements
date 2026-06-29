using API.Extensions;
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
using FluentValidation;
using Hangfire;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);


// ==========================================
// 1. Core API Configuration
// ==========================================
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
        Description = "Enter 'Bearer' [space] and then your token."
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
        { new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } }, new string[] {} }
    });
});

// ==========================================
// 2. Database & Identity Configuration
// ==========================================
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// ==========================================
// 3. Settings Binding (Zero Hardcoding)
// ==========================================
builder.Services.Configure<PaymobSettings>(builder.Configuration.GetSection("PaymobSettings"));
builder.Services.Configure<OrderSettings>(builder.Configuration.GetSection("OrderSettings"));
builder.Services.Configure<LoyaltySettings>(builder.Configuration.GetSection("LoyaltySettings"));
builder.Services.Configure<AffiliateSettings>(builder.Configuration.GetSection("AffiliateSettings"));
builder.Services.Configure<ClearanceSettings>(builder.Configuration.GetSection("ClearanceSettings"));

// ==========================================
// 4. Dependency Injection (Services & Repos)
// ==========================================
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(RegisterUserCommand).Assembly));
builder.Services.AddValidatorsFromAssembly(typeof(Core.Application.Features.Sales.Validators.AddToCartCommandValidator).Assembly);
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(Core.Application.Behaviors.ValidationBehavior<,>));
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddHttpClient<IPaymentService, PaymobPaymentService>();

// SignalR & Notifications
builder.Services.AddSignalR();
builder.Services.AddScoped<IStockNotificationService, StockNotificationService>();
builder.Services.AddScoped<IFlashSaleNotificationService, FlashSaleNotificationService>();
builder.Services.AddScoped<IDosageNotificationService, DosageNotificationService>();

// ==========================================
// 5. Authentication & JWT Setup
// ==========================================
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
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
        ClockSkew = TimeSpan.Zero
    };
});

// ==========================================
// 6. Hangfire Background Jobs
// ==========================================
builder.Services.AddHangfire(configuration => configuration
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddHangfireServer();

// ==========================================
// 7 CORS Configuration
// ==========================================
var allowedOrigins = builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
// ==========================================
// App Pipeline
// ==========================================
var app = builder.Build();

app.UseMiddleware<API.Middlewares.GlobalExceptionMiddleware>();
// Execute Data Seeder on Startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<Core.Infrastructure.Persistence.ApplicationDbContext>();
    dbContext.Database.Migrate();

    await DataSeeder.SeedRolesAndAdminsAsync(scope.ServiceProvider, app.Configuration);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("CorsPolicy");
app.UseAuthentication();
app.UseAuthorization();

// Setup Endpoints & Hubs
app.UseHangfireDashboard("/hangfire");
app.MapHub<StockHub>("/hubs/stock");
app.MapControllers();

// Register Recurring Jobs
RecurringJob.AddOrUpdate<IMediator>("Process-Daily-Subscriptions", m => m.Send(new ProcessDueSubscriptionsCommand(), CancellationToken.None), Cron.Daily);
RecurringJob.AddOrUpdate<IMediator>("Process-Stock-Notifications", m => m.Send(new ProcessStockNotificationsCommand(), CancellationToken.None), Cron.Hourly);
RecurringJob.AddOrUpdate<IMediator>("Process-Dynamic-Clearance", m => m.Send(new ProcessDynamicClearanceCommand(), CancellationToken.None), Cron.Daily);
RecurringJob.AddOrUpdate<IMediator>("Process-Dosage-Reminders", m => m.Send(new ProcessDosageRemindersCommand(), CancellationToken.None), "*/15 * * * *");

app.Run();