using System.Text.Json.Serialization;
using QRScannerPass.Config;
using QRScannerPass.Consul.Extensions;
using QRScannerPass.Data;
using QRScannerPass.Web.Auth;
using QRScannerPass.Web.Swagger;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddKeycloakAuthentication(builder.Configuration);

builder.Host.ConfigureServices(service =>
{
    var consulClient = new ConsulClient(AppConfig.AppId);
    builder.Configuration.AddConsul(consulClient);
    
    var config = AppConfig.Init(builder.Configuration);
    service.AddSingleton(config)
        .ConfigureSqlServer(config.Data.ConnectionString)
        .AddHostedService<ApplyDbContextMigrationsHostedService<Context>>()
        .AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
});


// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.OperationFilter<AddMethodNameOperationFilter>();

    c.UseRemoveEndSchemaIdSelector();
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseAuthentication();
app.UseRouting();
app.UseAuthorization();

app.MapControllers();

app.Run();