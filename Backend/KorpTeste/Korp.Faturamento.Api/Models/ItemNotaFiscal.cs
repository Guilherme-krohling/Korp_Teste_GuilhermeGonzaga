using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization; // <-- 1. ADICIONE ESTE "USING" NO TOPO

namespace Korp.Faturamento.Api.Models
{
    public class ItemNotaFiscal
    {
        public int Id { get; set; }

        [Required]
        public string CodigoProduto { get; set; } = string.Empty;

        [Range(1, int.MaxValue, ErrorMessage = "A quantidade deve ser de no mínimo 1")]
        public int Quantidade { get; set; }

        // --- Relacionamento com a NotaFiscal ---
        public int NotaFiscalId { get; set; }

        // --- 2. ADICIONE O [JsonIgnore] AQUI ---
        [JsonIgnore]
        public NotaFiscal? NotaFiscal { get; set; }
    }
}