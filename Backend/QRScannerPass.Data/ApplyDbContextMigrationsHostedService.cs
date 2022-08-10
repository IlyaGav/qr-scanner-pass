using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace QRScannerPass.Data;

public class ApplyDbContextMigrationsHostedService<TContext> : IHostedService where TContext : DbContext
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ApplyDbContextMigrationsHostedService<TContext>> _logger;

    public ApplyDbContextMigrationsHostedService(
        IServiceProvider serviceProvider,
        ILogger<ApplyDbContextMigrationsHostedService<TContext>> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Database migrations check...");
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<TContext>();
        try
        {
            await dbContext.Database.MigrateAsync(cancellationToken);
        }
        catch (Exception e)
        {
            _logger.LogCritical(e, "Database migration has failed");
            throw;
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}