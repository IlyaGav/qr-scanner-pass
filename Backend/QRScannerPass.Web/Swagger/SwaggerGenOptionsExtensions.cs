using Swashbuckle.AspNetCore.SwaggerGen;

namespace QRScannerPass.Web.Swagger;

/// <summary>
/// Пользовательские расширения для SwaggerGenOptions
/// </summary>
public static class SwaggerGenOptionsExtensions
{
    /// <summary>
    /// Убирает "DTO" с конца названия класса
    /// </summary>
    public static void UseRemoveEndSchemaIdSelector(this SwaggerGenOptions swaggerGenOptions)
    {
        var defaultSchemaIdSelector = swaggerGenOptions.SchemaGeneratorOptions.SchemaIdSelector;

        string RemoveEndDtoSchemaIdSelector(Type modelType)
        {
            var name = defaultSchemaIdSelector(modelType);

            if (name.EndsWith("DTO", StringComparison.CurrentCultureIgnoreCase))
            {
                name = name.Remove(name.Length - 3);
            }

            return name;
        }

        swaggerGenOptions.CustomSchemaIds(RemoveEndDtoSchemaIdSelector);
    }
}