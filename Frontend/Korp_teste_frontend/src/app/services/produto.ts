import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; // Importação principal do RxJS

// Criamos uma interface para o nosso modelo 'Produto'
export interface Produto {
  id?: number; // '?' significa que é opcional (não temos ao criar)
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
}