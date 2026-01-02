import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * MsJsonEditorLite - Editor JSON simplificado
 * Conforme component-specs.md
 * - Textarea monospace
 * - Botões: Format, Validate, Copy
 */
@Component({
  selector: 'ms-json-editor-lite',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <div class="json-editor" [attr.data-testid]="testId">
      <div class="editor-header">
        <label class="editor-label">{{ title }}</label>
        <div class="editor-actions">
          <button
            mat-icon-button
            matTooltip="Formatar JSON"
            (click)="formatJson()"
            [disabled]="readOnly || mode === 'text'"
            [attr.data-testid]="testId + '.format'">
            <mat-icon>auto_fix_high</mat-icon>
          </button>
          <button
            mat-icon-button
            matTooltip="Validar JSON"
            (click)="validateJson()"
            [disabled]="mode === 'text'"
            [attr.data-testid]="testId + '.validate'">
            <mat-icon>check_circle</mat-icon>
          </button>
          <button
            mat-icon-button
            matTooltip="Copiar"
            (click)="copyToClipboard()"
            [attr.data-testid]="testId + '.copy'">
            <mat-icon>content_copy</mat-icon>
          </button>
        </div>
      </div>

      <mat-form-field appearance="outline" class="editor-field">
        <textarea
          matInput
          [value]="valueText"
          (input)="onInputChange($event)"
          [readonly]="readOnly"
          [style.height.px]="height"
          [attr.aria-label]="title"
          [attr.aria-describedby]="hasError ? testId + '.error' : null"
          class="editor-textarea"
          spellcheck="false">
        </textarea>
        <mat-error *ngIf="hasError" [id]="testId + '.error'">
          {{ errorMessage }}
        </mat-error>
      </mat-form-field>

      <div *ngIf="validationMessage" class="validation-message" [class.success]="isValid" [class.error]="!isValid">
        <mat-icon>{{ isValid ? 'check_circle' : 'error' }}</mat-icon>
        {{ validationMessage }}
      </div>
    </div>
  `,
  styles: [`
    .json-editor {
      display: flex;
      flex-direction: column;
    }

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .editor-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--mat-sys-on-surface);
    }

    .editor-actions {
      display: flex;
      gap: 4px;
    }

    .editor-field {
      width: 100%;
    }

    .editor-textarea {
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.5;
      resize: vertical;
    }

    .validation-message {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      margin-top: 4px;
    }

    .validation-message.success {
      color: #00B050;
    }

    .validation-message.error {
      color: #E81828;
    }

    .validation-message mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
  `]
})
export class JsonEditorLiteComponent implements OnInit, OnChanges {
  @Input() title = 'JSON';
  @Input() valueText = '';
  @Input() mode: 'json' | 'text' = 'json';
  @Input() readOnly = false;
  @Input() height = 200;
  @Input() testId = 'json-editor';
  @Input() required = false;

  @Output() onChange = new EventEmitter<string>();
  @Output() onValidJson = new EventEmitter<any>();

  hasError = false;
  errorMessage = '';
  validationMessage = '';
  isValid = false;

  ngOnInit(): void {
    if (this.mode === 'json' && this.valueText) {
      this.validateSilently();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['valueText'] && !changes['valueText'].firstChange) {
      this.clearValidation();
    }
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    const newValue = target.value;
    this.onChange.emit(newValue);
    this.clearValidation();

    // Validação silenciosa para emitir onValidJson
    if (this.mode === 'json') {
      this.validateSilently();
    }
  }

  formatJson(): void {
    if (this.mode !== 'json' || this.readOnly) return;

    try {
      const parsed = JSON.parse(this.valueText);
      const formatted = JSON.stringify(parsed, null, 2);
      this.onChange.emit(formatted);
      this.validationMessage = 'JSON formatado com sucesso';
      this.isValid = true;
    } catch (e) {
      this.hasError = true;
      this.errorMessage = 'JSON inválido. Verifique a sintaxe.';
      this.validationMessage = 'JSON inválido';
      this.isValid = false;
    }
  }

  validateJson(): void {
    if (this.mode === 'text') return;

    if (!this.valueText.trim()) {
      if (this.required) {
        this.hasError = true;
        this.errorMessage = 'Campo obrigatório.';
        this.validationMessage = 'Campo obrigatório';
        this.isValid = false;
      } else {
        this.validationMessage = 'Campo vazio';
        this.isValid = true;
      }
      return;
    }

    try {
      const parsed = JSON.parse(this.valueText);
      this.hasError = false;
      this.errorMessage = '';
      this.validationMessage = 'JSON válido';
      this.isValid = true;
      this.onValidJson.emit(parsed);
    } catch (e) {
      this.hasError = true;
      this.errorMessage = 'JSON inválido. Verifique a sintaxe.';
      this.validationMessage = 'JSON inválido';
      this.isValid = false;
    }
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.valueText);
    this.validationMessage = 'Copiado!';
    setTimeout(() => {
      this.validationMessage = '';
    }, 2000);
  }

  private validateSilently(): void {
    if (!this.valueText.trim()) return;

    try {
      const parsed = JSON.parse(this.valueText);
      this.onValidJson.emit(parsed);
    } catch {
      // Silencioso
    }
  }

  private clearValidation(): void {
    this.hasError = false;
    this.errorMessage = '';
    this.validationMessage = '';
  }
}
