using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace QRScannerPass.Web.Auth;

public static class AuthenticationExtensions
{
    public static AuthenticationBuilder AddKeycloakAuthentication(this IServiceCollection services,
        IConfiguration configuration)
    {
        return services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority =
                    $"{configuration["Keycloak:Domain"]}/realms/{configuration["Keycloak:Realm"]}";
                options.Audience = configuration["Keycloak:Audience"];
                options.RequireHttpsMetadata = configuration.GetValue<bool>("Keycloak:RequireHttpsMetadata");

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = configuration.GetValue<bool>(configuration["Keycloak:ValidateIssuer"]),
                };
            });
    }
}