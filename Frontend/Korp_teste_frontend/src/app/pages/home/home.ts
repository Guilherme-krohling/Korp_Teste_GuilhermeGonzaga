// 1. IMPORTAR ViewChild
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
// 2. IMPORTAR MatTableDataSource
import { MatTableModule, MatTableDataSource } from '@angular/material/table'; 
import { MatFormFieldModule } from '@angular/material/form-field';
// 3. IMPORTAR MatCardHeader (corrigido)
import { MatCardModule, MatCardHeader } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon'; 
// 4. IMPORTAR MatSort e MatSortModule
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

import { ProdutoService, Produto } from '../../services/produto';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  imports: [ 
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatFormFieldModule,
    MatCardModule,
    MatCardHeader, // <-- Corrigido
    MatIconModule,
    MatSortModule,  // <-- Adicionado
    MatPaginatorModule
  ]
})
export class Home implements OnInit {
  
  private produtoService = inject(ProdutoService);
  private snackBar = inject(MatSnackBar);

  @ViewChild('produtoForm') produtoForm!: NgForm;
  
  // 5. ADICIONAR ViewChild para o MatSort
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  produtoSelecionado: Produto | null = null; 
  tituloFormulario: string = 'Cadastrar Novo Produto';
  
  // 6. MUDAR de 'produtos' para 'dataSource'
  dataSource = new MatTableDataSource<Produto>();
  displayedColumns: string[] = ['codigo', 'descricao', 'saldo', 'acoes']; 

  formProduto: Produto = {
    id: 0,
    codigo: '',
    descricao: '',
    saldo: 0
  };

  ngOnInit(): void {
    this.carregarProdutos();
  }
  aplicarFiltro(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      // O filter já busca em todos os campos do objeto
      this.dataSource.filter = filterValue.trim().toLowerCase(); 

      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
  }
  carregarProdutos(): void {
    this.produtoService.getProdutos().subscribe(data => {
      // 7. POPULAR O dataSource
      this.dataSource.data = data;
      // 8. CONECTAR O SORT (Esta é a "mágica" que faltava)
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  // ... (O resto do seu código, salvarProduto, excluirProduto, etc., continua aqui)
  // ...
  salvarProduto(): void {
     if (this.produtoSelecionado) {
      this.produtoService.updateProduto(this.formProduto)
        .pipe(catchError((err) => this.handleError(err, 'editar')))
        .subscribe(() => {
          this.mostrarNotificacao('Produto atualizado com sucesso!');
          this.cancelarEdicao();
          this.carregarProdutos();
        });
    } else {
      const { id, ...novoProduto } = this.formProduto; 
      this.produtoService.addProduto(novoProduto as Produto)
        .pipe(catchError((err) => this.handleError(err, 'cadastrar')))
        .subscribe((produtoCriado) => {
          this.mostrarNotificacao(`Produto "${produtoCriado.descricao}" cadastrado!`);
          this.limparFormulario();
          this.carregarProdutos();
        });
    }
  }
  selecionarParaEditar(produto: Produto): void {
    this.produtoSelecionado = { ...produto }; 
    this.formProduto = { ...produto };
    this.tituloFormulario = `Editando Produto: ${produto.descricao}`;
  }
  cancelarEdicao(): void {
    this.produtoSelecionado = null;
    this.tituloFormulario = 'Cadastrar Novo Produto';
    this.limparFormulario();
  }
  excluirProduto(produto: Produto): void {
    if (confirm(`Tem certeza que deseja excluir o produto "${produto.descricao}"?`)) {
      this.produtoService.deleteProduto(produto.id!)
        .pipe(catchError((err) => this.handleError(err, 'excluir')))
        .subscribe(() => {
          this.mostrarNotificacao('Produto excluído com sucesso!');
          this.carregarProdutos();
        });
    }
  }
  limparFormulario(): void {
    this.produtoForm.resetForm();
    this.formProduto = { id: 0, codigo: '', descricao: '', saldo: 0 };
  }
  private handleError(erro: HttpErrorResponse, acao: string) {
    let msg = `Erro ao ${acao} produto.`;
    if (erro.status === 409) {
      msg = 'Erro: Já existe outro produto com este código.';
    } else if (erro.status === 404) {
      msg = 'Erro: Produto não encontrado.';
    }
    this.mostrarNotificacao(msg, true);
    return throwError(() => new Error(erro.message));
  }
  mostrarNotificacao(mensagem: string, erro: boolean = false): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 3000,
      panelClass: erro ? ['snackbar-erro'] : ['snackbar-sucesso']
    });
  }
}