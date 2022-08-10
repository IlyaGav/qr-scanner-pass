using QRScannerPass.Config;
using QRScannerPass.Data;
using QRScannerPass.Web.Swagger;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

builder.Host.ConfigureServices(service =>
{
    var config = AppConfig.Init(builder.Configuration);
    service.AddSingleton(config)
        .ConfigureSqlServer(config.Data.SqlServer)
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

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();