import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConnectorsService } from '../../../core/services/api/connectors.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { ConnectorDto, createDefaultConnector } from '../../../shared/models/connector.model';

export interface ConnectorDialogData {
  mode: 'create' | 'edit';
  connector?: ConnectorDto;
}

/**
 * ConnectorDialog - Dialog para criar/editar conector
 * Conforme pages/connectors.md
 */
@Component({
  selector: 'ms-connector-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Novo Conector' : 'Editar Conector' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="connector-form">
        <!-- ID (only for create) -->
        <mat-form-field *ngIf="data.mode === 'create'" appearance="outline" class="full-width">
          <mat-label>ID do Conector</mat-label>
          <input
            matInput
            formControlName="id"
            placeholder="ex: api-vendas"
            data-testid="connector-dialog.id">
          <mat-hint>Identificador único do conector</mat-hint>
          <mat-error *ngIf="form.get('id')?.hasError('required')">Campo obrigatório.</mat-error>
        </mat-form-field>

        <!-- Name -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome</mat-label>
          <input
            matInput
            formControlName="name"
            placeholder="ex: API de Vendas"
            data-testid="connector-dialog.name">
          <mat-error *ngIf="form.get('name')?.hasError('required')">Campo obrigatório.</mat-error>
        </mat-form-field>

        <!-- Base URL -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Base URL</mat-label>
          <input
            matInput
            formControlName="baseUrl"
            placeholder="https://api.example.com"
            data-testid="connector-dialog.baseUrl">
          <mat-error *ngIf="form.get('baseUrl')?.hasError('required')">Campo obrigatório.</mat-error>
          <mat-error *ngIf="form.get('baseUrl')?.hasError('pattern')">URL inválida.</mat-error>
        </mat-form-field>

        <!-- Auth Ref -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Auth Ref</mat-label>
          <input
            matInput
            formControlName="authRef"
            placeholder="ex: API_KEY_VENDAS"
            data-testid="connector-dialog.authRef">
          <mat-hint>Nome da variável de ambiente com credenciais</mat-hint>
          <mat-error *ngIf="form.get('authRef')?.hasError('required')">Campo obrigatório.</mat-error>
        </mat-form-field>

        <!-- Timeout -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Timeout (segundos)</mat-label>
          <input
            matInput
            type="number"
            formControlName="timeoutSeconds"
            min="1"
            data-testid="connector-dialog.timeout">
          <mat-error *ngIf="form.get('timeoutSeconds')?.hasError('required')">Campo obrigatório.</mat-error>
          <mat-error *ngIf="form.get('timeoutSeconds')?.hasError('min')">O timeout deve ser maior ou igual a 1.</mat-error>
        </mat-form-field>

        <!-- API Token (write-only) -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>API Token</mat-label>
          <input
            matInput
            type="password"
            formControlName="apiToken"
            placeholder="Token de autenticação (opcional)"
            data-testid="connector-dialog.apiToken"
            autocomplete="new-password">
          <mat-hint *ngIf="data.mode === 'create'">
            Token Bearer usado para autenticar contra a API externa (opcional).
          </mat-hint>
          <mat-hint *ngIf="data.mode === 'edit' && !hasApiToken">
            Deixe vazio para manter o token atual. Preencha para substituir.
          </mat-hint>
          <mat-hint *ngIf="data.mode === 'edit' && hasApiToken" class="token-configured">
            <mat-icon class="hint-icon">check_circle</mat-icon>
            Token configurado. Deixe vazio para manter, preencha para substituir.
          </mat-hint>
          <mat-error *ngIf="form.get('apiToken')?.hasError('maxlength')">
            Máximo de 4096 caracteres.
          </mat-error>
          <button
            *ngIf="data.mode === 'edit' && hasApiToken"
            mat-icon-button
            matSuffix
            type="button"
            (click)="clearToken()"
            [disabled]="saving"
            matTooltip="Limpar token (remover)"
            data-testid="connector-dialog.clearToken">
            <mat-icon>backspace</mat-icon>
          </button>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button
        mat-button
        [mat-dialog-close]="false"
        [disabled]="saving"
        data-testid="connector-dialog.cancel">
        Cancelar
      </button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="!form.valid || saving"
        (click)="save()"
        data-testid="connector-dialog.save">
        <mat-spinner *ngIf="saving" diameter="20"></mat-spinner>
        {{ saving ? 'Salvando...' : (data.mode === 'create' ? 'Criar' : 'Salvar') }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .connector-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 400px;
    }

    .full-width {
      width: 100%;
    }

    mat-spinner {
      margin-right: 8px;
    }

    .token-configured {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--mat-sys-primary);
    }

    .hint-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
  `]
})
export class ConnectorDialogComponent implements OnInit {
  readonly data = inject<ConnectorDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConnectorDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly connectorsService = inject(ConnectorsService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly snackbar = inject(SnackbarService);

  form!: FormGroup;
  saving = false;
  hasApiToken = false;
  clearingToken = false;

  ngOnInit(): void {
    this.initForm();

    if (this.data.mode === 'edit' && this.data.connector) {
      this.hasApiToken = this.data.connector.hasApiToken || false;
      this.patchForm(this.data.connector);
    }
  }

  save(): void {
    if (!this.form.valid || this.saving) return;

    this.saving = true;
    const formValue = this.form.getRawValue();

    const dto: ConnectorDto = {
      id: formValue.id,
      name: formValue.name,
      baseUrl: formValue.baseUrl,
      authRef: formValue.authRef,
      timeoutSeconds: formValue.timeoutSeconds,
      enabled: true
    };

    // Semântica apiToken:
    // - Create: se preenchido => enviar string
    // - Edit: se clearingToken => enviar null; se preenchido => enviar string; se vazio => omitir
    if (this.data.mode === 'create') {
      const token = formValue.apiToken?.trim();
      if (token && token.length > 0) {
        dto.apiToken = token;
      }
    } else {
      // Edit mode
      if (this.clearingToken) {
        dto.apiToken = null;
      } else {
        const token = formValue.apiToken?.trim();
        if (token && token.length > 0) {
          dto.apiToken = token;
        }
        // Se vazio => não incluir (omitir, mantém token no backend)
      }
    }

    const request = this.data.mode === 'create'
      ? this.connectorsService.create(dto)
      : this.connectorsService.update(this.data.connector!.id, dto);

    request.subscribe({
      next: () => {
        this.snackbar.success(
          this.data.mode === 'create'
            ? 'Conector criado com sucesso.'
            : 'Conector atualizado com sucesso.'
        );
        this.dialogRef.close(true);
      },
      error: (error) => {
        const uiError = this.errorHandler.handleHttpError(error);
        this.errorHandler.showError(uiError);
        this.saving = false;
      }
    });
  }

  clearToken(): void {
    this.clearingToken = true;
    this.form.patchValue({ apiToken: '' });
  }

  private initForm(): void {
    const urlPattern = /^https?:\/\/.+/;

    this.form = this.fb.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      baseUrl: ['', [Validators.required, Validators.pattern(urlPattern)]],
      authRef: ['', Validators.required],
      timeoutSeconds: [60, [Validators.required, Validators.min(1)]],
      apiToken: ['', [Validators.maxLength(4096)]]
    });
  }

  private patchForm(connector: ConnectorDto): void {
    this.form.patchValue({
      id: connector.id,
      name: connector.name,
      baseUrl: connector.baseUrl,
      authRef: connector.authRef,
      timeoutSeconds: connector.timeoutSeconds,
      apiToken: '' // SEMPRE vazio em edit, conforme spec
    });

    // Disable ID field in edit mode
    this.form.get('id')?.disable();
  }
}
