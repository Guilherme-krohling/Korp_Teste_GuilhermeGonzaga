using Korp.Faturamento.Api.Data;
using Korp.Faturamento.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Korp.Faturamento.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotasFiscaisController : ControllerBase
    {
        private readonly FaturamentoContext _context;
        private readonly ILogger<NotasFiscaisController> _logger;
        private readonly IHttpClientFactory _httpClientFactory;

        public NotasFiscaisController(FaturamentoContext context, ILogger<NotasFiscaisController> logger, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _logger = logger;
            _httpClientFactory = httpClientFactory;
        }

        // ==========================================================
        // ENDPOINT 1: GET /api/notasfiscais (Listar todas)
        // ==========================================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotaFiscal>>> GetNotasFiscais()
        {
            try
            {
                // Inclui os Itens de cada nota na consulta
                var notas = await _context.NotasFiscais
                                        .Include(n => n.Itens)
                                        .ToListAsync();
                return Ok(notas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar a lista de notas fiscais.");
                return StatusCode(500, "Erro interno do servidor.");
            }
        }

        // =Dica de Modelo para o Frontend
        // (O frontend vai nos mandar um objeto assim, sem o 'id', 'status', etc.)
        public class NotaFiscalInputModel
        {
            public List<ItemNotaFiscalInputModel> Itens { get; set; } = new List<ItemNotaFiscalInputModel>();
        }
        public class ItemNotaFiscalInputModel
        {
            public string CodigoProduto { get; set; } = string.Empty;
            public int Quantidade { get; set; }
        }


        // ==========================================================
        // ENDPOINT 2: POST /api/notasfiscais (Cadastrar nova)
        // ==========================================================
        [HttpPost]
        public async Task<ActionResult<NotaFiscal>> PostNotaFiscal(NotaFiscalInputModel input)
        {
            if (input.Itens == null || !input.Itens.Any())
            {
                return BadRequest(new { message = "A nota fiscal deve ter pelo menos um item." });
            }

            try
            {
                // Mapeia o Input (simples) para o Modelo (completo)
                var novaNota = new NotaFiscal
                {
                    Status = NotaFiscalStatus.Aberta, // Status inicial é "Aberta"
                    Itens = input.Itens.Select(itemInput => new ItemNotaFiscal
                    {
                        CodigoProduto = itemInput.CodigoProduto,
                        Quantidade = itemInput.Quantidade
                    }).ToList()
                };

                _context.NotasFiscais.Add(novaNota);
                await _context.SaveChangesAsync();

                // Define o Número Sequencial (requisito) usando o Id
                // Em um banco real, isso seria feito com uma 'sequence' ou 'trigger'
                novaNota.NumeroSequencial = novaNota.Id;
                await _context.SaveChangesAsync();

                // Retorna 201 Created
                return CreatedAtAction(nameof(GetNotaFiscalPorId), new { id = novaNota.Id }, novaNota);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro inesperado ao criar nota fiscal.");
                return StatusCode(500, "Erro interno do servidor.");
            }
        }
        // ==========================================================
        // ENDPOINT 3: PUT /api/notasfiscais/{id}/imprimir (A Lógica Central)
        // ==========================================================
        [HttpPut("{id}/imprimir")]
        public async Task<IActionResult> ImprimirNotaFiscal(int id)
        {
            // 1. Encontra a nota fiscal no banco DESTE serviço
            var notaFiscal = await _context.NotasFiscais
                                           .Include(n => n.Itens)
                                           .FirstOrDefaultAsync(n => n.Id == id);

            if (notaFiscal == null)
            {
                return NotFound(new { message = "Nota Fiscal não encontrada." });
            }

            // 2. Requisito: Não permitir a impressão de notas com status diferente de Aberta
            if (notaFiscal.Status != NotaFiscalStatus.Aberta)
            {
                return BadRequest(new { message = "Esta nota fiscal não pode ser impressa pois já está fechada." });
            }

            // 3. Requisito: Comunicação entre Microsserviços
            var client = _httpClientFactory.CreateClient();

            var estoqueApiUrl = "http://localhost:5191/api/produtos/abater-saldo";

            try
            {
                // 4. Requisito: Atualizar o saldo dos produtos
                foreach (var item in notaFiscal.Itens)
                {
                    var abaterSaldoModel = new
                    {
                        CodigoProduto = item.CodigoProduto,
                        Quantidade = item.Quantidade
                    };

                    // Faz a chamada PUT para a API de Estoque
                    var response = await client.PutAsJsonAsync(estoqueApiUrl, abaterSaldoModel);

                    // 5. Requisito: Tratamento de Falhas
                    if (!response.IsSuccessStatusCode)
                    {
                        // A API de Estoque falhou (ex: saldo insuficiente, produto não existe)
                        var erroMsg = await response.Content.ReadAsStringAsync();
                        _logger.LogError($"Falha ao abater saldo do produto {item.CodigoProduto}: {erroMsg}");

                        // Para a operação e avisa o usuário
                        return BadRequest(new
                        {
                            message = $"Falha ao processar item {item.CodigoProduto}. Operação cancelada.",
                            erroApiEstoque = erroMsg
                        });
                    }
                }

                // 6. Requisito: Atualizar o status da nota para Fechada
                notaFiscal.Status = NotaFiscalStatus.Fechada;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Nota Fiscal impressa (fechada) com sucesso!", nota = notaFiscal });
            }
            catch (Exception ex)
            {
                // 5. Requisito: Tratamento de Falhas (ex: API de Estoque está offline)
                _logger.LogError(ex, "Erro de conexão ao tentar comunicar com a API de Estoque.");
                return StatusCode(500, "Erro interno ao comunicar com o serviço de estoque.");
            }
        }
        // ==========================================================
        // ENDPOINT 4: DELETE /api/notasfiscais/{id} (Excluir Nota)
        // ==========================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotaFiscal(int id)
        {
            try
            {
                var notaFiscal = await _context.NotasFiscais
                                             .Include(n => n.Itens) // Puxa os itens
                                             .FirstOrDefaultAsync(n => n.Id == id);

                if (notaFiscal == null)
                {
                    return NotFound(new { message = "Nota Fiscal não encontrada." });
                }

                // Regra de Negócio: Não podemos excluir uma nota que já foi fechada
                if (notaFiscal.Status == NotaFiscalStatus.Fechada)
                {
                    return BadRequest(new
                    {
                        message = "Não é possível excluir uma nota fiscal que já foi fechada."
                    });
                }

                // O EF Core é inteligente: ao remover a nota,
                // ele também remove os Itens associados a ela (em cascata).
                _context.NotasFiscais.Remove(notaFiscal);
                await _context.SaveChangesAsync();

                return NoContent(); // Sucesso
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro inesperado ao excluir nota fiscal.");
                return StatusCode(500, "Erro interno do servidor.");
            }
        }

        // ==========================================================
        // ENDPOINT 5: PUT /api/notasfiscais/{id} (Editar Nota Aberta)
        // ==========================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> PutNotaFiscal(int id, NotaFiscalInputModel input)
        {
            if (input.Itens == null || !input.Itens.Any())
            {
                return BadRequest(new { message = "A nota fiscal deve ter pelo menos um item." });
            }

            try
            {
                // 1. Encontra a nota e seus itens atuais
                var notaFiscal = await _context.NotasFiscais
                                             .Include(n => n.Itens)
                                             .FirstOrDefaultAsync(n => n.Id == id);

                if (notaFiscal == null)
                {
                    return NotFound(new { message = "Nota Fiscal não encontrada." });
                }

                // 2. Regra de Negócio: Só pode editar notas ABERTAS
                if (notaFiscal.Status == NotaFiscalStatus.Fechada)
                {
                    return BadRequest(new { message = "Não é possível editar uma nota que já foi fechada." });
                }

                // 3. Lógica de Atualização:
                // Remove os itens antigos...
                _context.ItensNotaFiscal.RemoveRange(notaFiscal.Itens);

                // Adiciona os novos itens
                notaFiscal.Itens = input.Itens.Select(itemInput => new ItemNotaFiscal
                {
                    CodigoProduto = itemInput.CodigoProduto,
                    Quantidade = itemInput.Quantidade
                }).ToList();

                // Salva as mudanças
                await _context.SaveChangesAsync();

                return Ok(notaFiscal); // Retorna a nota atualizada
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro inesperado ao editar nota fiscal.");
                return StatusCode(500, "Erro interno do servidor.");
            }
        }


        // Endpoint auxiliar para o CreatedAtAction
        [HttpGet("{id}")]
        public async Task<ActionResult<NotaFiscal>> GetNotaFiscalPorId(int id)
        {
            var nota = await _context.NotasFiscais
                                    .Include(n => n.Itens)
                                    .FirstOrDefaultAsync(n => n.Id == id);

            if (nota == null)
            {
                return NotFound();
            }
            return Ok(nota);
        }

    }
}