import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface KeyValueItem {
  key: string;
  value: string;
}

/**
 * MsKeyValueEditor - Editor de pares chave-valor
 * Conforme component-specs.md
 * - Usado para headers e queryParams
 * - Remove chaves vazias no submit
 * - Detecta duplicatas
 */
@Component({
  selector: 'ms-key-value-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="key-value-editor" [attr.data-testid]="testId">
      <label class="editor-label">{{ title }}</label>

      <div class="items-container">
        <div *ngFor="let item of items; let i = index; trackBy: trackByIndex" class="item-row">
          <mat-form-field appearance="outline" class="key-field">
            <mat-label>{{ placeholderKey }}</mat-label>
            <input
              matInput
              [(ngModel)]="item.key"
              (ngModelChange)="onItemChange()"
              [disabled]="disabled"
              [attr.data-testid]="testId + '.key.' + i">
          </mat-form-field>

          <mat-form-field appearance="outline" class="value-field">
            <mat-label>{{ placeholderValue }}</mat-label>
            <input
              matInput
              [(ngModel)]="item.value"
              (ngModelChange)="onItemChange()"
              [disabled]="disabled"
              [attr.data-testid]="testId + '.value.' + i">
          </mat-form-field>

          <button
            mat-icon-button
            color="warn"
            (click)="removeItem(i)"
            [disabled]="disabled"
            aria-label="Remover item"
            [attr.data-testid]="testId + '.remove.' + i">
            <mat-icon>delete</mat-icon>
          </button>
        </div>

        <div *ngIf="items.length === 0" class="empty-hint">
          Nenhum item adicionado.
        </div>
      </div>

      <button
        mat-button
        color="primary"
        (click)="addItem()"
        [disabled]="disabled"
        [attr.data-testid]="testId + '.add'">
        <mat-icon>add</mat-icon>
        Adicionar
      </button>

      <div *ngIf="hasDuplicates" class="error-message">
        <mat-icon>error</mat-icon>
        Valor inválido.
      </div>
    </div>
  `,
  styles: [`
    .key-value-editor {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .editor-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--mat-sys-on-surface);
    }

    .items-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .item-row {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .key-field {
      flex: 1;
    }

    .value-field {
      flex: 2;
    }

    .empty-hint {
      font-size: 14px;
      color: var(--mat-sys-on-surface-variant);
      padding: 8px 0;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #E81828;
      font-size: 12px;
    }

    .error-message mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
  `]
})
export class KeyValueEditorComponent implements OnInit {
  @Input() title = 'Itens';
  @Input() value: KeyValueItem[] = [];
  @Input() placeholderKey = 'Chave';
  @Input() placeholderValue = 'Valor';
  @Input() disabled = false;
  @Input() testId = 'key-value-editor';

  @Output() onChange = new EventEmitter<KeyValueItem[]>();

  items: KeyValueItem[] = [];
  hasDuplicates = false;

  ngOnInit(): void {
    // Cria cópia para não modificar o input diretamente
    this.items = this.value.map(item => ({ ...item }));
  }

  addItem(): void {
    this.items.push({ key: '', value: '' });
    this.onItemChange();
  }

  removeItem(index: number): void {
    this.items.splice(index, 1);
    this.onItemChange();
  }

  onItemChange(): void {
    this.checkDuplicates();
    this.onChange.emit([...this.items]);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private checkDuplicates(): void {
    const keys = this.items
      .map(item => item.key.trim().toLowerCase())
      .filter(key => key !== '');

    const uniqueKeys = new Set(keys);
    this.hasDuplicates = keys.length !== uniqueKeys.size;
  }
}
