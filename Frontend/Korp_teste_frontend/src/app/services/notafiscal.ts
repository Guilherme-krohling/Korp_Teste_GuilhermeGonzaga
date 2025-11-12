import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface ItemNotaFiscal {
  id: number;
  codigoProduto: string;
  quantidade: number;
  notaFiscalId: number;
}

export interface NotaFiscal {
  id: number;
  numeroSequencial: number;
  status: 'Aberta' | 'Fechada';
  itens: ItemNotaFiscal[];
}

export interface ItemNotaFiscalInput {
  codigoProduto: string;
  quantidade: number;
}

export interface NotaFiscalInput {
  itens: ItemNotaFiscalInput[];
}

@Injectable({
  providedIn: 'root'
})
export class NotafiscalService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5289/api/notasfiscais'; 

  getNotasFiscais(): Observable<NotaFiscal[]> {
    return this.http.get<NotaFiscal[]>(this.apiUrl);
  }

  addNotaFiscal(notaInput: NotaFiscalInput): Observable<NotaFiscal> {
    return this.http.post<NotaFiscal>(this.apiUrl, notaInput);
  }

  imprimirNotaFiscal(id: number): Observable<NotaFiscal> {
    return this.http.put<NotaFiscal>(`${this.apiUrl}/${id}/imprimir`, {});
  }

  getNotaFiscalPorId(id: number): Observable<NotaFiscal> {
    return this.http.get<NotaFiscal>(`${this.apiUrl}/${id}`);
  }

  deleteNotaFiscal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateNotaFiscal(id: number, notaInput: NotaFiscalInput): Observable<NotaFiscal> {
  return this.http.put<NotaFiscal>(`${this.apiUrl}/${id}`, notaInput);
  }
}