using System.ComponentModel.DataAnnotations;

namespace Korp.Faturamento.Api.Models
{
    // Enum para o Status, conforme o requisito
    public enum NotaFiscalStatus
    {
        Aberta,
        Fechada
    }

    public class NotaFiscal
    {
        public int Id { get; set; }

        // Usaremos o 'Id' como número sequencial por simplicidade
        // Em um sistema real, isso seria um campo separado
        public int NumeroSequencial { get; set; }

        public NotaFiscalStatus Status { get; set; }

        // Uma Nota Fiscal pode ter VÁRIOS Itens
        public ICollection<ItemNotaFiscal> Itens { get; set; } = new List<ItemNotaFiscal>();
    }
}