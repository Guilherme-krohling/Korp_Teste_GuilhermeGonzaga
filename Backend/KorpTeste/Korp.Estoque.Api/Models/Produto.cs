using System.ComponentModel.DataAnnotations;

namespace Korp.Estoque.Api.Models
{
    public class Produto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O campo Código é obrigatório")]
        public string Codigo { get; set; } = string.Empty;

        [Required(ErrorMessage = "O campo Descrição é obrigatório")]
        public string Descricao { get; set; } = string.Empty;

        [Range(0, int.MaxValue, ErrorMessage = "O Saldo não pode ser negativo")]
        public int Saldo { get; set; }
    }
}