using Korp.Faturamento.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Korp.Faturamento.Api.Data
{
    public class FaturamentoContext : DbContext
    {
        public FaturamentoContext(DbContextOptions<FaturamentoContext> options) : base(options)
        {
        }

        // Informa ao EF Core sobre nossas duas novas tabelas
        public DbSet<NotaFiscal> NotasFiscais { get; set; }
        public DbSet<ItemNotaFiscal> ItensNotaFiscal { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configura o relacionamento: Uma NotaFiscal tem Muitos Itens
            modelBuilder.Entity<NotaFiscal>()
                .HasMany(n => n.Itens)
                .WithOne(i => i.NotaFiscal)
                .HasForeignKey(i => i.NotaFiscalId);
        }
    }
}