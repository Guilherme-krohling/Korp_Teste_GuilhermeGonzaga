import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ItemNotaFiscalInput, NotaFiscal, NotafiscalService } from '../../../services/notafiscal';
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
  
  private notafiscalService = inject(NotafiscalService);
  private snackBar = inject(MatSnackBar);
  public dialogRef = inject(MatDialogRef<ModalEditNota>);
  
  public data: { 
    notaId: number, 
    listaProdutos: Produto[], 
    isReadOnly?: boolean
  } = inject(MAT_DIALOG_DATA);

  public notaCarregada: NotaFiscal | null = null;
  public itensParaSalvar: ItemNotaFiscalInput[] = [];
  public novoItem: ItemNotaFiscalInput = { codigoProduto: '', quantidade: 1 };
  public isLoading = true;
  public isSaving = false;
  public isReadOnly = false;

  ngOnInit(): void {
    this.isReadOnly = this.data.isReadOnly ?? false;
    this.notafiscalService.getNotaFiscalPorId(this.data.notaId).subscribe(nota => {
      this.notaCarregada = nota;
      this.itensParaSalvar = nota.itens.map(item => ({
        codigoProduto: item.codigoProduto,
        quantidade: item.quantidade
      }));
      this.isLoading = false;
    });
  }
  getDescricaoProduto(codigo: string): string {
      const produto = this.data.listaProdutos.find(p => p.codigo === codigo);
    
      return produto ? produto.descricao : 'Produto não encontrado';
  }
  
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
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(`Erro ao salvar: ${err.error.message}`, 'Fechar', { duration: 3000 });
      }
    });
  }

  fecharModal(): void {
    this.dialogRef.close();
  }
}