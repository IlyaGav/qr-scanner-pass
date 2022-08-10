using Microsoft.Extensions.Configuration;

namespace QRScannerPass.Config;

public class AppConfig
{
    private AppConfig(IConfiguration configuration)
    {
        Data = configuration.GetSection(nameof(Data)).Get<AppDataConfig>();

        if (Data is null)
        {
            throw new Exception($"В конфигурации отстутствует раздел {nameof(Data)}");
        }
    }

    public AppDataConfig Data { get; private set; }

    public static AppConfig Init(IConfiguration configuration)
    {
        return new AppConfig(configuration);
    }
}

public record AppDataConfig
{
    public string SqlServer { get; set; }
}