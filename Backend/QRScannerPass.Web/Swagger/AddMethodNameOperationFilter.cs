using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace QRScannerPass.Web.Swagger;

public class AddMethodNameOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var methodName = context.MethodInfo.Name;
        var value = char.ToLowerInvariant(methodName[0]) + methodName[1..];
        operation.Extensions.Add("x-operation-name", new OpenApiString(value));
    }
}