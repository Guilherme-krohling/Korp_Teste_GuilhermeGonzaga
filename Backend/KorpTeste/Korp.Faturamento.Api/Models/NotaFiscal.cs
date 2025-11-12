using System.ComponentModel.DataAnnotations;

namespace Korp.Faturamento.Api.Models
{
    public enum NotaFiscalStatus
    {
        Aberta,
        Fechada
    }

    public class NotaFiscal
    {
        public int Id { get; set; }

        public int NumeroSequencial { get; set; }

        public NotaFiscalStatus Status { get; set; }

        public ICollection<ItemNotaFiscal> Itens { get; set; } = new List<ItemNotaFiscal>();
    }
}