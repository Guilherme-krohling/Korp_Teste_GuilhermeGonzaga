using Korp.Estoque.Api.Data;
using Korp.Estoque.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Korp.Estoque.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProdutosController : ControllerBase
    {
        private readonly EstoqueContext _context;
        private readonly ILogger<ProdutosController> _logger;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public ProdutosController(EstoqueContext context, ILogger<ProdutosController> logger, IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        // ==========================================================
        // ENDPOINT 1: GET /api/produtos (Listar todos)
        // ==========================================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Produto>>> GetProdutos()
        {
            try
            {
                var produtos = await _context.Produtos.ToListAsync();
                return Ok(produtos);
            }
            catch (Exception ex)
            {
                // Tratamento de Erro
                _logger.LogError(ex, "Erro ao buscar a lista de produtos.");
                return StatusCode(500, "Erro interno do servidor. Por favor, tente novamente mais tarde.");
            }
        }

        // ==========================================================
        // ENDPOINT 2: POST /api/produtos (Cadastrar novo)
        // ==========================================================
        [HttpPost]
        public async Task<ActionResult<Produto>> PostProduto(Produto produto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                bool codigoJaExiste = await _context.Produtos
                                                .AnyAsync(p => p.Codigo == produto.Codigo);

                if (codigoJaExiste)
                {
                    return Conflict(new { message = "Já existe um produto com este código." });
                }

                _context.Produtos.Add(produto);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetProdutoPorId), new { id = produto.Id }, produto);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Erro ao salvar produto no banco.");
                return StatusCode(500, "Erro ao salvar no banco de dados.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro inesperado ao criar produto.");
                return StatusCode(500, "Erro interno do servidor.");
            }
        }

        // ==========================================================
        // ENDPOINT 3: PUT /api/produtos/abater-saldo (Para o Faturamento)
        // ==========================================================
        public class AbaterSaldoModel
        {
            public string CodigoProduto { get; set; } = string.Empty;
            public int Quantidade { get; set; }
        }

        [HttpPut("abater-saldo")]
        public async Task<IActionResult> AbaterSaldo([FromBody] AbaterSaldoModel model)
        {
            try
            {
                var produto = await _context.Produtos
                                        .FirstOrDefaultAsync(p => p.Codigo == model.CodigoProduto);

                if (produto == null)
                {
                    return NotFound(new { message = "Produto não encontrado." });
                }

                if (produto.Saldo < model.Quantidade)
                {
                    return BadRequest(new { message = "Saldo insuficiente em estoque." });
                }

                produto.Saldo -= model.Quantidade;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Saldo abatido com sucesso.", novoSaldo = produto.Saldo });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao abater saldo do produto.");
                return StatusCode(500, "Erro interno ao atualizar saldo.");
            }
        }

        // ==========================================================
        // ENDPOINT AUXILIAR: GET /api/produtos/{id} (Usado pelo PostProduto)
        // ==========================================================
        [HttpGet("{id}")]
        public async Task<ActionResult<Produto>> GetProdutoPorId(int id)
        {
            try
            {
                var produto = await _context.Produtos.FindAsync(id);

                if (produto == null)
                {
                    return NotFound(new { message = "Produto não encontrado." });
                }

                return Ok(produto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar produto por ID.");
                return StatusCode(500, "Erro interno do servidor.");
            }
        }
        // ==========================================================
        // ENDPOINT 4: PUT /api/produtos/{id} (Editar Produto)
        // ==========================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduto(int id, Produto produto)
        {
            if (id != produto.Id)
            {
                return BadRequest(new { message = "O ID do produto na URL não corresponde ao ID no corpo da requisição." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                bool codigoJaExiste = await _context.Produtos
                                                .AnyAsync(p => p.Codigo == produto.Codigo && p.Id != id);

                if (codigoJaExiste)
                {
                    return Conflict(new { message = "Já existe outro produto com este código." });
                }

                _context.Entry(produto).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Produtos.Any(p => p.Id == id))
                {
                    return NotFound(new { message = "Produto não encontrado." });
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro inesperado ao editar produto.");
                return StatusCode(500, "Erro interno do servidor.");
            }
        }

        // ==========================================================
        // ENDPOINT 5: DELETE /api/produtos/{id} (Excluir Produto)
        // ==========================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduto(int id)
        {
            try
            {
                var produto = await _context.Produtos.FindAsync(id);
                if (produto == null)
                {
                    return NotFound(new { message = "Produto não encontrado." });
                }

                _context.Produtos.Remove(produto);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro inesperado ao excluir produto.");
                return StatusCode(500, "Erro interno do servidor.");
            }
        }

        public class SugerirDescricaoModel
        {
            public string Prompt { get; set; } = string.Empty;
        }

        // ==========================================================
        // ENDPOINT 6: POST /api/produtos/sugerir-descricao (IA)
        // ==========================================================
        [HttpPost("sugerir-descricao")]
        public async Task<IActionResult> SugerirDescricao([FromBody] SugerirDescricaoModel model)
        {
            var apiKey = _configuration["GroqApiKey"];
            if (string.IsNullOrEmpty(apiKey))
            {
                return StatusCode(500, new { message = "Chave de API da IA não configurada no backend." });
            }

            var apiUrl = "https://api.groq.com/openai/v1/chat/completions";
            var client = _httpClientFactory.CreateClient();

            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var promptCompleto = $"Gere um nome de produto técnico e realista para: '{model.Prompt}'. Inclua uma marca e especificações fictícias ou comuns. " +
                $"Responda APENAS o nome do produto. Por exemplo, se a entrada for 'Mouse gamer', uma boa resposta seria 'Mouse Gamer Razer DeathAdder V3 30K DPI'. " +
                $"Se a entrada for 'Monitor 240hz', uma boa resposta seria 'Monitor Gamer AOC Agon 27\" 240Hz 1ms'. " +
                $"IMPORTANTE: os nomes precisam ser variados entao não foque sempre em uma marca ou modelo, respostas aleátorias por favor.";

            var requestBody = new
            {
                model = "llama-3.1-8b-instant",
                messages = new[]
                {
            new { role = "user", content = promptCompleto }
        },
                temperature = 0.7
            };

            try
            {
                var jsonBody = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

                var response = await client.PostAsync(apiUrl, content);

                if (!response.IsSuccessStatusCode)
                {
                    var erroApi = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"Erro da API Groq: {erroApi}");
                    return StatusCode((int)response.StatusCode, new { message = "Erro ao chamar a API de IA.", details = erroApi });
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();

                JsonNode? root = JsonNode.Parse(jsonResponse);
                if (root == null)
                {
                    return StatusCode(500, new { message = "Resposta da IA em formato inválido." });
                }

                string text = root["choices"]![0]!["message"]!["content"]!.GetValue<string>();

                return Ok(new { descricaoSugerida = text });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Falha ao processar sugestão de descrição.");
                return StatusCode(500, new { message = "Erro interno no servidor." });
            }
        }
    }
}