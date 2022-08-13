using Microsoft.EntityFrameworkCore;
using QRScannerPass.Core.Models;

namespace QRScannerPass.Data;

#pragma warning disable CS8618

public class Context : DbContext
{
    public DbSet<Ticket> Tickets { get; set; }

    public Context(DbContextOptions<Context> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Ticket>(builder =>
        {
            builder.HasKey(u => u.Code);

            builder.HasIndex(u => u.Name);

            builder.HasIndex(u => u.State);
            
            builder.HasIndex(u => u.CreateDate);

            builder.Property(t => t.CreateDate).HasColumnType("timestamp without time zone");

            builder.Property(t => t.State).HasConversion<string>();
        });

        base.OnModelCreating(modelBuilder);
    }
}

#pragma warning restore CS8618