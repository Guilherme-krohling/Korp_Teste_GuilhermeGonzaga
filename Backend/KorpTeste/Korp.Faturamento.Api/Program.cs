using Korp.Faturamento.Api.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization; // Para o [JsonStringEnumConverter]

var builder = WebApplication.CreateBuilder(args);

// ===================================
// 1. DEFINIR A POLÍTICA DE CORS
// ===================================
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          policy.WithOrigins("http://localhost:4200") // Permite seu Angular
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});

// =GET /api/notasfiscais (Listar todas)==================================

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<FaturamentoContext>(options =>
    options.UseSqlite(connectionString)
);

// Adiciona o HttpClient (para a Fase 5)
builder.Services.AddHttpClient();

// Adiciona controladores e o conversor de Enum para String
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(MyAllowSpecificOrigins);
//app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Código das migrations
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<FaturamentoContext>();
        context.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocorreu um erro ao aplicar as migrations do Faturamento.");
    }
}

app.Run();