using Korp.Faturamento.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace Korp.Faturamento.Api.Migrations
{
    [DbContext(typeof(FaturamentoContext))]
    partial class FaturamentoContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "9.0.10");

            modelBuilder.Entity("Korp.Faturamento.Api.Models.ItemNotaFiscal", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("CodigoProduto")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<int>("NotaFiscalId")
                        .HasColumnType("INTEGER");

                    b.Property<int>("Quantidade")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.HasIndex("NotaFiscalId");

                    b.ToTable("ItensNotaFiscal");
                });

            modelBuilder.Entity("Korp.Faturamento.Api.Models.NotaFiscal", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("NumeroSequencial")
                        .HasColumnType("INTEGER");

                    b.Property<int>("Status")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.ToTable("NotasFiscais");
                });

            modelBuilder.Entity("Korp.Faturamento.Api.Models.ItemNotaFiscal", b =>
                {
                    b.HasOne("Korp.Faturamento.Api.Models.NotaFiscal", "NotaFiscal")
                        .WithMany("Itens")
                        .HasForeignKey("NotaFiscalId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("NotaFiscal");
                });

            modelBuilder.Entity("Korp.Faturamento.Api.Models.NotaFiscal", b =>
                {
                    b.Navigation("Itens");
                });
#pragma warning restore 612, 618
        }
    }
}
