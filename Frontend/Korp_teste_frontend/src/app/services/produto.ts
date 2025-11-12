import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; // Importação principal do RxJS

// Criamos uma interface para o nosso modelo 'Produto'
export interface Produto {
  id?: number;
  codigo: string;
  descricao: string;
  saldo: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  
  private apiUrl = 'https://localhost:7080/api/produtos'; 

  constructor(private http: HttpClient) { }

  // GET: Retorna um Observable com a lista de produtos
  getProdutos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl);
  }

  // POST: Retorna um Observable com o produto criado
  addProduto(produto: Produto): Observable<Produto> {
    return this.http.post<Produto>(this.apiUrl, produto);
  }

  // PUT: Atualiza um produto existente
  updateProduto(produto: Produto): Observable<void> {
    // Note a URL: .../api/produtos/5 (usando o ID do produto)
    return this.http.put<void>(`${this.apiUrl}/${produto.id}`, produto);
  }

  // DELETE: Exclui um produto
  deleteProduto(id: number): Observable<void> {
    // Note a URL: .../api/produtos/5
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  sugerirDescricao(prompt: string): Observable<any> {
    const iaApiUrl = 'http://localhost:5191/api/produtos/sugerir-descricao';
    return this.http.post<any>(iaApiUrl, { prompt: prompt });
  }

}