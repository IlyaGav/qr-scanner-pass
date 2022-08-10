using Microsoft.EntityFrameworkCore;
using QRScannerPass.Core.Models;

namespace QRScannerPass.Data;

#pragma warning disable CS8618

public class Context : DbContext
{
    public DbSet<User> Users { get; set; }

    public DbSet<QrCode> QrCodes { get; set; }

    public Context(DbContextOptions<Context> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(builder =>
        {
            builder.HasKey(u => u.Id);

            builder.HasIndex(u => u.FullName);
        });

        modelBuilder.Entity<QrCode>(builder =>
        {
            builder.HasKey(q => q.Code);

            builder.HasOne(uq => uq.User)
                .WithMany()
                .HasForeignKey(h => h.UserId);
            
            builder.HasIndex(q => q.UserId).IsUnique();
        });

        base.OnModelCreating(modelBuilder);
    }
}

#pragma warning restore CS8618