using Korp.Estoque.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Korp.Estoque.Api.Data
{
    public class EstoqueContext : DbContext
    {
        public EstoqueContext(DbContextOptions<EstoqueContext> options) : base(options)
        {
        }

        // Informa ao Entity Framework que existe uma tabela "Produtos"
        // que será baseada no modelo "Produto"
        public DbSet<Produto> Produtos { get; set; }
    }
}