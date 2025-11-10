import { Component, OnInit, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// Imports do Material para o Modal
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Nossos serviços e interfaces
// 🚨 CORREÇÃO AQUI: O caminho não deve ter '.service' no final
import { NotafiscalService, NotaFiscal, ItemNotaFiscalInput } from '../../../services/notafiscal';
import { Produto } from '../../../services/produto';

@Component({
  selector: 'app-modal-edit-nota',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './modal-edit-nota.html',
  styleUrls: ['./modal-edit-nota.css']
})
export class ModalEditNota implements OnInit {
  
  // Injeção de dependências
  private notafiscalService = inject(NotafiscalService);
  private snackBar = inject(MatSnackBar);

  // Referência ao Modal (para fechar)
  public dialogRef = inject(MatDialogRef<ModalEditNota>);
  
  // Recebendo os dados (ID da nota e lista de produtos) da página principal
  public data: { notaId: number, listaProdutos: Produto[] } = inject(MAT_DIALOG_DATA);

  // Variáveis locais
  public notaCarregada: NotaFiscal | null = null;
  public itensParaSalvar: ItemNotaFiscalInput[] = [];
  public novoItem: ItemNotaFiscalInput = { codigoProduto: '', quantidade: 1 };
  public isLoading = true; // Controla o spinner de "carregando nota"
  public isSaving = false; // Controla o spinner de "salvando"

  ngOnInit(): void {
    // Busca os dados da nota fiscal assim que o modal abre
    this.notafiscalService.getNotaFiscalPorId(this.data.notaId).subscribe(nota => {
      this.notaCarregada = nota;
      // Copia os itens da nota para o nosso array de edição
      this.itensParaSalvar = nota.itens.map(item => ({
        codigoProduto: item.codigoProduto,
        quantidade: item.quantidade
      }));
      this.isLoading = false;
    });
  }

  // --- Funções do Formulário ---
  adicionarItem(): void {
    if (this.novoItem.codigoProduto && this.novoItem.quantidade > 0) {
      this.itensParaSalvar.push({ ...this.novoItem });
      this.novoItem = { codigoProduto: '', quantidade: 1 };
    }
  }

  removerItem(index: number): void {
    this.itensParaSalvar.splice(index, 1);
  }

  salvarEdicao(): void {
    if (this.itensParaSalvar.length === 0) {
      this.snackBar.open('A nota deve ter pelo menos um item.', 'Fechar', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const notaInput = { itens: this.itensParaSalvar };

    this.notafiscalService.updateNotaFiscal(this.data.notaId, notaInput).subscribe({
      next: () => {
        this.isSaving = false;
        // Fecha o modal e envia 'true' (sucesso) de volta para a página
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(`Erro ao salvar: ${err.error.message}`, 'Fechar', { duration: 3000 });
      }
    });
  }

  fecharModal(): void {
    // Fecha o modal sem enviar resposta (cancelar)
    this.dialogRef.close();
  }
}