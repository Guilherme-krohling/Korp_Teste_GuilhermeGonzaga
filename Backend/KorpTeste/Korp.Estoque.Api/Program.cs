using Korp.Estoque.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;

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
                          policy.WithOrigins("http://localhost:4200",
                                             "http://localhost:5191",
                                             "http://localhost:5289")
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});


var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<EstoqueContext>(options =>
    options.UseSqlite(connectionString)
);

var spaPath = "../../../Frontend/Korp_teste_frontend/dist/korp_teste_frontend/browser";

builder.Services.AddSpaStaticFiles(configuration =>{configuration.RootPath = spaPath;});

builder.Services.AddHttpClient();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


// ==========================================================
// <<< ADICIONAR: 3. Diga ao app para USAR a política de CORS
// (A ordem é importante: Tem que vir ANTES de UseAuthorization)
// ==========================================================
app.UseCors(MyAllowSpecificOrigins);
app.UseStaticFiles();
app.UseSpaStaticFiles();
app.UseAuthorization();
app.MapControllers();

app.MapFallbackToFile("index.html", new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, spaPath)
    )
});

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
app.Run();