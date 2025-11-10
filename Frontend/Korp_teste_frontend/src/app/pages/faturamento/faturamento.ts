import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule, MatCardHeader} from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog'; // <-- ADICIONADO
import { ModalEditNota } from './modal-edit-nota/modal-edit-nota'; // <-- ADICIONADO

// Nossos serviços e interfaces
import { NotafiscalService, NotaFiscal, ItemNotaFiscalInput } from '../../services/notafiscal';
import { Produto, ProdutoService } from '../../services/produto';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-faturamento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatCardHeader,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './faturamento.html',
  styleUrls: ['./faturamento.css']
})
export class Faturamento implements OnInit {

  // Injeção de dependências
  private notafiscalService = inject(NotafiscalService);
  private snackBar = inject(MatSnackBar);
  private produtoService = inject(ProdutoService);
  private dialog = inject(MatDialog); // <-- ADICIONADO

  // Lista para o dropdown
  listaProdutos: Produto[] = [];

  // Para a tabela de listagem
  notasFiscais: NotaFiscal[] = [];
  displayedColumns: string[] = ['numeroSequencial', 'status', 'itens', 'acoes'];

  // Para o formulário de "Novo Item"
  novoItem: ItemNotaFiscalInput = {
    codigoProduto: '',
    quantidade: 1
  };
  
  itensDaNovaNota: ItemNotaFiscalInput[] = [];
  imprimindoId: number | null = null; 

  ngOnInit(): void {
    this.carregarNotasFiscais();
    this.carregarProdutos(); 
  }

  carregarNotasFiscais(): void {
    this.notafiscalService.getNotasFiscais().subscribe(data => {
      this.notasFiscais = data;
    });
  }

  carregarProdutos(): void {
    this.produtoService.getProdutos().subscribe(data => {
      this.listaProdutos = data;
    });
  }

  // --- Funções do Formulário de Cadastro ---
  adicionarItem(): void {
    if (this.novoItem.codigoProduto && this.novoItem.quantidade > 0) {
      this.itensDaNovaNota.push({ ...this.novoItem });
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
        this.itensDaNovaNota = []; 
        this.carregarNotasFiscais();
      },
      error: (err) => {
        this.mostrarNotificacao('Erro ao criar nota fiscal.', true);
        console.error(err);
      }
    });
  }

  // --- NOVO MÉTODO PARA ABRIR O MODAL DE EDIÇÃO ---
  abrirModalEdicao(nota: NotaFiscal): void {
    // Abre o componente 'ModalEditNota' como um pop-up
    const dialogRef = this.dialog.open(ModalEditNota, {
      width: '600px',
      // Passa os dados para o modal (o ID da nota e a lista de produtos)
      data: { 
        notaId: nota.id,
        listaProdutos: this.listaProdutos // Passa a lista que já carregamos!
      }
    });

    // Ouve a resposta do modal (quando ele fechar)
    dialogRef.afterClosed().subscribe(resultado => {
      // Se o resultado for 'true' (significa que salvou)
      if (resultado === true) {
        this.mostrarNotificacao(`Nota Fiscal #${nota.numeroSequencial} atualizada!`);
        this.carregarNotasFiscais(); // Atualiza a tabela
      }
    });
  }

  // --- Funções da Tabela de Listagem ---
  onImprimirNota(nota: NotaFiscal): void {
    if (nota.status === 'Fechada') {
      this.mostrarNotificacao('Esta nota já foi fechada.', true);
      return;
    }

    this.imprimindoId = nota.id;

    this.notafiscalService.imprimirNotaFiscal(nota.id)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.mostrarNotificacao(`Erro: ${err.error.message || 'Falha ao imprimir.'}`, true);
          this.imprimindoId = null; 
          return throwError(() => new Error(err.message));
        })
      )
      .subscribe((notaAtualizada) => {
        this.mostrarNotificacao(`Nota Fiscal #${notaAtualizada.numeroSequencial} fechada com sucesso!`);
        this.imprimindoId = null; 
        this.carregarNotasFiscais();
      });
  }

  excluirNota(nota: NotaFiscal): void {
    if (this.imprimindoId === nota.id) return; 

    if (nota.status === 'Fechada') {
      this.mostrarNotificacao('Não é possível excluir uma nota fechada.', true);
      return;
    }

    if (confirm(`Tem certeza que deseja excluir a Nota Fiscal #${nota.numeroSequencial}?`)) {
      this.notafiscalService.deleteNotaFiscal(nota.id)
        .pipe(
          catchError((err: HttpErrorResponse) => {
            this.mostrarNotificacao(`Erro: ${err.error.message || 'Falha ao excluir.'}`, true);
            return throwError(() => new Error(err.message));
          })
        )
        .subscribe(() => {
          this.mostrarNotificacao(`Nota Fiscal #${nota.numeroSequencial} excluída com sucesso!`);
          this.carregarNotasFiscais();
        });
    }
  }

  // --- Funções Auxiliares ---
  mostrarNotificacao(mensagem: string, erro: boolean = false): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 3000,
      panelClass: erro ? ['snackbar-erro'] : ['snackbar-sucesso']
    });
  }
}