import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

// Componentes do Material
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule, MatCardHeader} from '@angular/material/card';

import { MatSnackBar} from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon'; 

// Nosso serviço e modelo
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
    MatCardHeader,
    MatIconModule
  ]
})
export class Home implements OnInit {
  
  private produtoService = inject(ProdutoService);
  private snackBar = inject(MatSnackBar);

  @ViewChild('produtoForm') produtoForm!: NgForm;

  // --- LÓGICA DE EDIÇÃO ---
  produtoSelecionado: Produto | null = null; 
  tituloFormulario: string = 'Cadastrar Novo Produto';
  // --- FIM LÓGICA DE EDIÇÃO ---

  produtos: Produto[] = [];
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

  carregarProdutos(): void {
    this.produtoService.getProdutos().subscribe(data => {
      this.produtos = data;
    });
  }

  // --- NOVA LÓGICA DE SALVAR ---
  salvarProduto(): void {
    if (this.produtoSelecionado) {
      // Modo Edição (PUT)
      this.produtoService.updateProduto(this.formProduto)
        .pipe(catchError((err) => this.handleError(err, 'editar')))
        .subscribe(() => {
          this.mostrarNotificacao('Produto atualizado com sucesso!');
          this.cancelarEdicao();
          this.carregarProdutos();
        });
    } else {
      // Modo Cadastro (POST)
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

  // --- NOVA LÓGICA DE EDIÇÃO ---
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
  
  // --- NOVA LÓGICA DE EXCLUSÃO ---
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

  // --- NOVA FUNÇÃO DE ERRO ---
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