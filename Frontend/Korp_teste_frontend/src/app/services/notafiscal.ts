import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- Interfaces (Modelos do Frontend) ---
// Representa o item *dentro* da nota (vindo do backend)
export interface ItemNotaFiscal {
  id: number;
  codigoProduto: string;
  quantidade: number;
  notaFiscalId: number;
}

// Representa a Nota Fiscal (vinda do backend)
export interface NotaFiscal {
  id: number;
  numeroSequencial: number;
  status: 'Aberta' | 'Fechada'; // Usamos o tipo string!
  itens: ItemNotaFiscal[];
}

// Representa o item que vamos *enviar* para criar uma nota
export interface ItemNotaFiscalInput {
  codigoProduto: string;
  quantidade: number;
}

// Representa a nota que vamos *enviar* para criar
export interface NotaFiscalInput {
  itens: ItemNotaFiscalInput[];
}

// --- Fim das Interfaces ---

@Injectable({
  providedIn: 'root'
})
export class NotafiscalService {

  private http = inject(HttpClient);

  // porta HTTP correta da API de FATURAMENTO
  // (http://localhost:5289)
  private apiUrl = 'http://localhost:5289/api/notasfiscais'; 

  // GET: Lista todas as notas fiscais
  getNotasFiscais(): Observable<NotaFiscal[]> {
    return this.http.get<NotaFiscal[]>(this.apiUrl);
  }

  // POST: Cria uma nova nota fiscal
  addNotaFiscal(notaInput: NotaFiscalInput): Observable<NotaFiscal> {
    return this.http.post<NotaFiscal>(this.apiUrl, notaInput);
  }

  // PUT: Manda o comando de "imprimir" (fechar a nota)
  imprimirNotaFiscal(id: number): Observable<NotaFiscal> {
    // Note a URL: .../api/notasfiscais/1/imprimir
    return this.http.put<NotaFiscal>(`${this.apiUrl}/${id}/imprimir`, {});
  }

  // GET (por ID): Busca uma única nota fiscal
  getNotaFiscalPorId(id: number): Observable<NotaFiscal> {
    return this.http.get<NotaFiscal>(`${this.apiUrl}/${id}`);
  }

  // DELETE: Exclui uma nota fiscal
  deleteNotaFiscal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // PUT: Atualiza uma nota fiscal existente
  updateNotaFiscal(id: number, notaInput: NotaFiscalInput): Observable<NotaFiscal> {
  return this.http.put<NotaFiscal>(`${this.apiUrl}/${id}`, notaInput);
  }
}