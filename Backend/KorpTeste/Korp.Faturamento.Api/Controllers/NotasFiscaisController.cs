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
                var novaNota = new NotaFiscal
                {
                    Status = NotaFiscalStatus.Aberta,
                    Itens = input.Itens.Select(itemInput => new ItemNotaFiscal
                    {
                        CodigoProduto = itemInput.CodigoProduto,
                        Quantidade = itemInput.Quantidade
                    }).ToList()
                };

                _context.NotasFiscais.Add(novaNota);
                await _context.SaveChangesAsync();

                novaNota.NumeroSequencial = novaNota.Id;
                await _context.SaveChangesAsync();

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
            var notaFiscal = await _context.NotasFiscais
                                           .Include(n => n.Itens)
                                           .FirstOrDefaultAsync(n => n.Id == id);

            if (notaFiscal == null)
            {
                return NotFound(new { message = "Nota Fiscal não encontrada." });
            }

            if (notaFiscal.Status != NotaFiscalStatus.Aberta)
            {
                return BadRequest(new { message = "Esta nota fiscal não pode ser impressa pois já está fechada." });
            }

            var client = _httpClientFactory.CreateClient();

            var estoqueApiUrl = "http://localhost:5191/api/produtos/abater-saldo";

            try
            {
                foreach (var item in notaFiscal.Itens)
                {
                    var abaterSaldoModel = new
                    {
                        CodigoProduto = item.CodigoProduto,
                        Quantidade = item.Quantidade
                    };

                    var response = await client.PutAsJsonAsync(estoqueApiUrl, abaterSaldoModel);

                    if (!response.IsSuccessStatusCode)
                    {
                        var erroApiEstoque = await response.Content.ReadFromJsonAsync<object>();

                        _logger.LogError($"Falha ao abater saldo. API de Estoque respondeu: {erroApiEstoque}");

                        return StatusCode((int)response.StatusCode, erroApiEstoque);
                    }
                }

                notaFiscal.Status = NotaFiscalStatus.Fechada;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Nota Fiscal impressa (fechada) com sucesso!", nota = notaFiscal });
            }
            catch (Exception ex)
            {
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
                                             .Include(n => n.Itens)
                                             .FirstOrDefaultAsync(n => n.Id == id);

                if (notaFiscal == null)
                {
                    return NotFound(new { message = "Nota Fiscal não encontrada." });
                }

                if (notaFiscal.Status == NotaFiscalStatus.Fechada)
                {
                    return BadRequest(new
                    {
                        message = "Não é possível excluir uma nota fiscal que já foi fechada."
                    });
                }
                _context.NotasFiscais.Remove(notaFiscal);
                await _context.SaveChangesAsync();

                return NoContent();
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
                var notaFiscal = await _context.NotasFiscais
                                             .Include(n => n.Itens)
                                             .FirstOrDefaultAsync(n => n.Id == id);

                if (notaFiscal == null)
                {
                    return NotFound(new { message = "Nota Fiscal não encontrada." });
                }

                if (notaFiscal.Status == NotaFiscalStatus.Fechada)
                {
                    return BadRequest(new { message = "Não é possível editar uma nota que já foi fechada." });
                }

                _context.ItensNotaFiscal.RemoveRange(notaFiscal.Itens);

                notaFiscal.Itens = input.Itens.Select(itemInput => new ItemNotaFiscal
                {
                    CodigoProduto = itemInput.CodigoProduto,
                    Quantidade = itemInput.Quantidade
                }).ToList();

                await _context.SaveChangesAsync();

                return Ok(notaFiscal);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro inesperado ao editar nota fiscal.");
                return StatusCode(500, "Erro interno do servidor.");
            }
        }


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