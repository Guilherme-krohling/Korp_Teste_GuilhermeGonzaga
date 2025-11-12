using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Korp.Faturamento.Api.Models
{
    public class ItemNotaFiscal
    {
        public int Id { get; set; }

        [Required]
        public string CodigoProduto { get; set; } = string.Empty;

        [Range(1, int.MaxValue, ErrorMessage = "A quantidade deve ser de no mínimo 1")]
        public int Quantidade { get; set; }

        public int NotaFiscalId { get; set; }

        [JsonIgnore]
        public NotaFiscal? NotaFiscal { get; set; }
    }
}