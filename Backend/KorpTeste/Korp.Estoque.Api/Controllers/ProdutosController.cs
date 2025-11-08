// Estes 'usings' são essenciais
using Korp.Estoque.Api.Data;
using Korp.Estoque.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Korp.Estoque.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProdutosController : ControllerBase
    {
        private readonly EstoqueContext _context;
        private readonly ILogger<ProdutosController> _logger;

        // 1. Injeção de Dependência: O .NET entrega o DbContext e o Logger
        public ProdutosController(EstoqueContext context, ILogger<ProdutosController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ==========================================================
        // ENDPOINT 1: GET /api/produtos (Listar todos)
        // ==========================================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Produto>>> GetProdutos()
        {
            try
            {
                // Uso de LINQ (ToListAsync) para buscar todos os produtos
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
            // Validação dos [Required] e [Range] que definimos no Modelo
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Uso de LINQ (AnyAsync) para verificar se o código já existe
                bool codigoJaExiste = await _context.Produtos
                                                .AnyAsync(p => p.Codigo == produto.Codigo);

                if (codigoJaExiste)
                {
                    // Tratamento de Erro (Regra de Negócio)
                    return Conflict(new { message = "Já existe um produto com este código." });
                }

                _context.Produtos.Add(produto);
                await _context.SaveChangesAsync(); // Salva no banco

                // Retorna 201 Created com o produto criado e um link para ele
                // (Boa prática RESTful)
                return CreatedAtAction(nameof(GetProdutoPorId), new { id = produto.Id }, produto);
            }
            catch (DbUpdateException ex)
            {
                // Tratamento de Erro Específico de Banco
                _logger.LogError(ex, "Erro ao salvar produto no banco.");
                return StatusCode(500, "Erro ao salvar no banco de dados.");
            }
            catch (Exception ex)
            {
                // Tratamento de Erro Genérico
                _logger.LogError(ex, "Erro inesperado ao criar produto.");
                return StatusCode(500, "Erro interno do servidor.");
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
                // Uso de LINQ (FindAsync) para buscar por Chave Primária
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
    }
}