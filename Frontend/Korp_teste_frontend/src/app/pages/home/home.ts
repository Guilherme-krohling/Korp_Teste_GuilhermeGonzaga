import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardHeader, MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { catchError, throwError } from 'rxjs';
import { Produto, ProdutoService } from '../../services/produto';

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
    MatCardHeader,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule
  ]
})
export class Home implements OnInit {
  
  private produtoService = inject(ProdutoService);
  private snackBar = inject(MatSnackBar);

  @ViewChild('produtoForm') produtoForm!: NgForm;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  produtoSelecionado: Produto | null = null; 
  tituloFormulario: string = 'Cadastrar Novo Produto';
  sugerindoDescricao = false;

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
      this.dataSource.filter = filterValue.trim().toLowerCase(); 

      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
  }
  carregarProdutos(): void {
    this.produtoService.getProdutos().subscribe(data => {
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
    });
  }

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

  sugerirDescricao(): void {
    const prompt = this.formProduto.descricao;

    if (!prompt) {
      this.mostrarNotificacao('Digite um nome de produto primeiro (ex: "Mouse Gamer").', true);
      return;
    }

    this.sugerindoDescricao = true;

    this.produtoService.sugerirDescricao(prompt).subscribe({
      next: (response) => {
        
        this.formProduto.descricao = response.descricaoSugerida.replace(/\"/g, '');
        this.sugerindoDescricao = false; 
      },
      error: (err) => {
        this.mostrarNotificacao('Erro ao contatar a IA. Verifique a chave de API.', true);
        this.sugerindoDescricao = false;
      }
    });
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