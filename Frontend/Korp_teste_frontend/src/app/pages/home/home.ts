import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

// Componentes do Material
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Nosso serviço e modelo
import { ProdutoService, Produto } from '../../services/produto'; // Verifique se o nome é 'produto.ts' ou 'produto.service.ts'
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true, // Garante que é standalone
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  imports: [ // Garante que 'imports' é a palavra correta
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatFormFieldModule,
    MatCardModule,
    MatSnackBarModule 
  ]
})
export class Home implements OnInit {
  
  // Injeção de dependência moderna
  private produtoService = inject(ProdutoService);
  private snackBar = inject(MatSnackBar);

  @ViewChild('produtoForm') produtoForm!: NgForm;

  produtos: Produto[] = [];
  displayedColumns: string[] = ['codigo', 'descricao', 'saldo'];

  novoProduto: Produto = {
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

  cadastrarProduto(): void {
    this.produtoService.addProduto(this.novoProduto)
      .pipe(
        catchError((erro: HttpErrorResponse) => {
          if (erro.status === 409) {
            this.mostrarNotificacao('Erro: Já existe um produto com este código.', true);
          } else {
            this.mostrarNotificacao('Erro ao cadastrar produto.', true);
          }
          return throwError(() => new Error('Erro no cadastro'));
        })
      )
      .subscribe((produtoCriado) => {
        this.mostrarNotificacao(`Produto "${produtoCriado.descricao}" cadastrado!`);
        this.carregarProdutos();
        this.limparFormulario();
      });
  }

  limparFormulario(): void {
    this.produtoForm.resetForm();
    this.novoProduto = { codigo: '', descricao: '', saldo: 0 };
  }

  mostrarNotificacao(mensagem: string, erro: boolean = false): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 3000,
      panelClass: erro ? ['snackbar-erro'] : ['snackbar-sucesso']
    });
  }
}