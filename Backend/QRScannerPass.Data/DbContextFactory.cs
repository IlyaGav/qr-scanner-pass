using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using QRScannerPass.Config;

namespace QRScannerPass.Data;

public class DbContextFactory : IDesignTimeDbContextFactory<Context>
{
    public Context CreateDbContext(string[] args)
    {
        var connectionString = GetConnectionString();

        var builder = new DbContextOptionsBuilder<Context>();
        builder.UseNpgsql(connectionString);

        return new Context(builder.Options);
    }

    private string GetConnectionString()
    {
        var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

        var builder = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", true, true);

        builder.AddEnvironmentVariables();

        var configuration = builder.Build();

        var appConfig = AppConfig.Init(configuration);

        if (appConfig.Data.ConnectionString is {Length: > 0} connection)
        {
            return connection;
        }

        throw new InvalidOperationException($"{nameof(AppConfig.Data)}:{nameof(AppConfig.Data.ConnectionString)} is not set");
    }
}