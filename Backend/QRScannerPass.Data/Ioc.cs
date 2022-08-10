using Microsoft.Extensions.DependencyInjection;

namespace QRScannerPass.Data;

public static class Ioc
{
    public static IServiceCollection ConfigureSqlServer(this IServiceCollection service, string connectionString)
    {
        return service.AddNpgsql<Context>(connectionString);
    }
}