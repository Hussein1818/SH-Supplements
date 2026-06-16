using Core.Domain.Entities;
using Core.Domain.Entities.Catalog;
using Core.Domain.Entities.Financials;
using Core.Domain.Entities.Sales;
using Core.Domain.Entities.System;
using Core.Domain.Entities.Users;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Core.Domain.Entities.Health;

namespace Core.Infrastructure.Persistence;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // Users
    public DbSet<UserProfile> UserProfiles { get; set; }
    public DbSet<Address> Addresses { get; set; }
    public DbSet<WishlistItem> WishlistItems { get; set; }
    public DbSet<UserDosageSchedule> UserDosageSchedules { get; set; }

    // Catalog
    public DbSet<Product> Products { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Brand> Brands { get; set; }
    public DbSet<ProductImage> ProductImages { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<ProductBundle> ProductBundles { get; set; }
    public DbSet<BundleItem> BundleItems { get; set; }
    public DbSet<StockNotificationRequest> StockNotificationRequests { get; set; }
    public DbSet<ProductSerialNumber> ProductSerialNumbers { get; set; }
    public DbSet<IngredientGlossary> IngredientGlossaries { get; set; }
    public DbSet<ProductAlternative> ProductAlternatives { get; set; }
    public DbSet<ActiveIngredient> ActiveIngredients { get; set; }
    public DbSet<ProductActiveIngredient> ProductActiveIngredients { get; set; }
    public DbSet<ProductDosageGuide> ProductDosageGuides { get; set; }

    // Sales
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Cart> Carts { get; set; }
    public DbSet<CartItem> CartItems { get; set; }
    public DbSet<ReturnRequest> ReturnRequests { get; set; }
    public DbSet<Coupon> Coupons { get; set; }
    public DbSet<AffiliateCode> AffiliateCodes { get; set; }

    // Financials
    public DbSet<PaymentTransaction> PaymentTransactions { get; set; }
    public DbSet<WalletTransaction> WalletTransactions { get; set; }

    // System
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<StockReservation> StockReservations { get; set; }
    public DbSet<ProductSubscription> ProductSubscriptions { get; set; }
    public DbSet<SubscriptionItem> SubscriptionItems { get; set; }

    // Health
    public DbSet<HealthMetricRecord> HealthMetricRecords { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // We will apply Fluent API configurations here dynamically later
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}