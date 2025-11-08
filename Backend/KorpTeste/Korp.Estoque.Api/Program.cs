using Korp.Estoque.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ==========================================================
// <<< ADICIONAR: 1. Definindo o nome da política de CORS
// ==========================================================
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

// ==========================================================
// <<< ADICIONAR: 2. Configurando o serviço de CORS
// ==========================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          // Esta linha permite que o seu app Angular
                          // (que roda na porta 4200) possa fazer chamadas
                          policy.WithOrigins("http://localhost:4200")
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});
// ==========================================================


// --- Código que você já tinha ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<EstoqueContext>(options =>
    options.UseSqlite(connectionString)
);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// --- Fim do código que você já tinha ---


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ==========================================================
// <<< ADICIONAR: 3. Diga ao app para USAR a política de CORS
// (A ordem é importante: Tem que vir ANTES de UseAuthorization)
// ==========================================================
app.UseCors(MyAllowSpecificOrigins);
// ==========================================================

app.UseAuthorization();
app.MapControllers();

// --- Código das Migrations que você já tinha ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<EstoqueContext>();
        context.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocorreu um erro ao aplicar as migrations.");
    }
}
// --- Fim do código das Migrations ---

app.Run();