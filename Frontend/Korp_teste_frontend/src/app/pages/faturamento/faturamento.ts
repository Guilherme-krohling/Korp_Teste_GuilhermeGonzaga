import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardHeader, MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ModalEditNota } from './modal-edit-nota/modal-edit-nota';

import { HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ItemNotaFiscalInput, NotaFiscal, NotafiscalService } from '../../services/notafiscal';
import { Produto, ProdutoService } from '../../services/produto';

@Component({
  selector: 'app-faturamento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatCardHeader, // <-- Corrigido
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatPaginatorModule
  ],
  templateUrl: './faturamento.html',
  styleUrls: ['./faturamento.css']
})
export class Faturamento implements OnInit {

  private notafiscalService = inject(NotafiscalService);
  private snackBar = inject(MatSnackBar);
  private produtoService = inject(ProdutoService);
  private dialog = inject(MatDialog);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  listaProdutos: Produto[] = [];

  dataSource = new MatTableDataSource<NotaFiscal>();
  displayedColumns: string[] = ['numeroSequencial', 'status', 'itens', 'acoes'];

  novoItem: ItemNotaFiscalInput = { codigoProduto: '', quantidade: 1 };
  itensDaNovaNota: ItemNotaFiscalInput[] = [];
  imprimindoId: number | null = null; 

  ngOnInit(): void {
    this.carregarNotasFiscais();
    this.carregarProdutos(); 
  }
  
  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  carregarNotasFiscais(): void {
    this.notafiscalService.getNotasFiscais().subscribe(data => {
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
    });
  }

  carregarProdutos(): void {
    this.produtoService.getProdutos().subscribe(data => {
      this.listaProdutos = data;
    });
  }
  getDescricaoProduto(codigo: string): string {
    const produto = this.listaProdutos.find(p => p.codigo === codigo);
    return produto ? produto.descricao : '...';
  }
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
  abrirModalEdicao(nota: NotaFiscal): void {
    const dialogRef = this.dialog.open(ModalEditNota, {
      width: '600px',
      data: { 
        notaId: nota.id,
        listaProdutos: this.listaProdutos,
        isReadOnly: false
      }
    });
    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado === true) {
        this.mostrarNotificacao(`Nota Fiscal #${nota.numeroSequencial} atualizada!`);
        this.carregarNotasFiscais();
      }
    });
  }
  abrirModalVisualizacao(nota: NotaFiscal): void {
    this.dialog.open(ModalEditNota, { 
      width: '600px',
      data: { 
        notaId: nota.id,
        listaProdutos: this.listaProdutos,
        isReadOnly: true
      }
    });
  }
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
  mostrarNotificacao(mensagem: string, erro: boolean = false): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 3000,
      panelClass: erro ? ['snackbar-erro'] : ['snackbar-sucesso']
    });
  }
}