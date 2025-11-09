import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

// Imports do Angular Material para esta página
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Para o "Imprimindo..."

// Nossos serviços e interfaces
// 🚨 CORREÇÃO AQUI: O caminho não deve ter '.service' no final
import { NotafiscalService, NotaFiscal, ItemNotaFiscalInput, NotaFiscalInput } from '../../services/notafiscal';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-faturamento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './faturamento.html',
  styleUrls: ['./faturamento.css']
})
export class Faturamento implements OnInit {

  // Injeção de dependências
  private notafiscalService = inject(NotafiscalService);
  private snackBar = inject(MatSnackBar);

  // Para a tabela de listagem
  notasFiscais: NotaFiscal[] = [];
  displayedColumns: string[] = ['numeroSequencial', 'status', 'itens', 'acoes'];

  // Para o formulário de "Novo Item"
  novoItem: ItemNotaFiscalInput = {
    codigoProduto: '',
    quantidade: 1
  };
  
  // Itens da nota que está sendo criada
  itensDaNovaNota: ItemNotaFiscalInput[] = [];
  
  // Para o "loading"
  imprimindoId: number | null = null; // Guarda o ID da nota que está "imprimindo"

  /**
   * CICLO DE VIDA: ngOnInit
   * Busca as notas fiscais assim que a página é carregada.
   */
  ngOnInit(): void {
    this.carregarNotasFiscais();
  }

  carregarNotasFiscais(): void {
    this.notafiscalService.getNotasFiscais().subscribe(data => {
      this.notasFiscais = data;
    });
  }

  // --- Funções do Formulário de Cadastro ---

  adicionarItem(): void {
    if (this.novoItem.codigoProduto && this.novoItem.quantidade > 0) {
      this.itensDaNovaNota.push({ ...this.novoItem });
      // Limpa o formulário de item
      this.novoItem = { codigoProduto: '', quantidade: 1 };
    }
  }

  removerItem(index: number): void {
    this.itensDaNovaNota.splice(index, 1);
  }

  criarNotaFiscal(): void {
    if (this.itensDaNovaNota.length === 0) {
      this.mostrarNotificacao('Adicione pelo menos um item à nota.', true);
      return;
    }

    this.notafiscalService.addNotaFiscal({ itens: this.itensDaNovaNota }).subscribe({
      next: (novaNota) => {
        this.mostrarNotificacao(`Nota Fiscal #${novaNota.numeroSequencial} criada com sucesso!`);
        this.itensDaNovaNota = []; // Limpa a lista de itens
        this.carregarNotasFiscais(); // Atualiza a tabela de notas
      },
      error: (err) => {
        this.mostrarNotificacao('Erro ao criar nota fiscal.', true);
        console.error(err);
      }
    });
  }

  // --- Funções da Tabela de Listagem ---

  /**
   * Requisito: Botão de impressão
   */
  onImprimirNota(nota: NotaFiscal): void {
    // Requisito: Não permitir a impressão de notas com status diferente de Aberta
    if (nota.status === 'Fechada') {
      this.mostrarNotificacao('Esta nota já foi fechada.', true);
      return;
    }

    // Requisito: Ao clicar no botão, exibir indicador de processamento
    this.imprimindoId = nota.id;

    this.notafiscalService.imprimirNotaFiscal(nota.id)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.mostrarNotificacao(`Erro: ${err.error.message || 'Falha ao imprimir.'}`, true);
          this.imprimindoId = null; // Para o spinner
          return throwError(() => new Error(err.message));
        })
      )
      .subscribe((notaAtualizada) => {
        // Requisito: Após finalização, atualizar o status da nota para Fechada
        this.mostrarNotificacao(`Nota Fiscal #${notaAtualizada.numeroSequencial} fechada com sucesso!`);
        this.imprimindoId = null; // Para o spinner
        this.carregarNotasFiscais(); // Atualiza a tabela
      });
  }

  // --- Funções Auxiliares ---

  mostrarNotificacao(mensagem: string, erro: boolean = false): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 3000,
      panelClass: erro ? ['snackbar-erro'] : ['snackbar-sucesso']
    });
  }
}