import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { ConnectorsService } from '../../../core/services/api/connectors.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { ConnectorDto, AuthType, ApiKeyLocation, RequestDefaults, createDefaultConnector } from '../../../shared/models/connector.model';

export interface ConnectorDialogData {
  mode: 'create' | 'edit';
  connector?: ConnectorDto;
}

/**
 * ConnectorDialog - Dialog para criar/editar conector
 * Delta 1.2.0: authType, API_KEY, BASIC, requestDefaults
 * Conforme pages/connectors.md e ui-field-catalog.md
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
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    MatExpansionModule
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

        <!-- Auth Type -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tipo de Autenticação</mat-label>
          <mat-select formControlName="authType" data-testid="connector-dialog.authType">
            <mat-option value="NONE">Nenhuma</mat-option>
            <mat-option value="BEARER">Bearer Token</mat-option>
            <mat-option value="API_KEY">API Key</mat-option>
            <mat-option value="BASIC">Basic Auth</mat-option>
          </mat-select>
        </mat-form-field>

        <!-- BEARER: API Token -->
        <div *ngIf="form.get('authType')?.value === 'BEARER'" class="auth-section">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>API Token</mat-label>
            <input
              matInput
              type="password"
              formControlName="apiToken"
              placeholder="Token de autenticação"
              data-testid="connector-dialog.apiToken"
              autocomplete="new-password">
            <mat-hint *ngIf="data.mode === 'create'">
              Token Bearer usado para autenticar contra a API externa.
            </mat-hint>
            <mat-hint *ngIf="data.mode === 'edit' && !hasApiToken">
              Preencha para configurar um token.
            </mat-hint>
            <mat-hint *ngIf="data.mode === 'edit' && hasApiToken" class="secret-configured">
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
              (click)="clearApiToken()"
              [disabled]="saving"
              matTooltip="Limpar token (remover)"
              data-testid="connector-dialog.clearApiToken">
              <mat-icon>backspace</mat-icon>
            </button>
          </mat-form-field>
        </div>

        <!-- API_KEY config -->
        <div *ngIf="form.get('authType')?.value === 'API_KEY'" class="auth-section">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Localização da API Key</mat-label>
            <mat-select formControlName="apiKeyLocation" data-testid="connector-dialog.apiKeyLocation">
              <mat-option value="HEADER">Header</mat-option>
              <mat-option value="QUERY">Query Parameter</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nome do Parâmetro</mat-label>
            <input
              matInput
              formControlName="apiKeyName"
              placeholder="ex: X-API-Key"
              data-testid="connector-dialog.apiKeyName">
            <mat-hint>Nome do header ou query param</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Valor da API Key</mat-label>
            <input
              matInput
              type="password"
              formControlName="apiKeyValue"
              placeholder="Valor secreto da API Key"
              data-testid="connector-dialog.apiKeyValue"
              autocomplete="new-password">
            <mat-hint *ngIf="data.mode === 'edit' && hasApiKey" class="secret-configured">
              <mat-icon class="hint-icon">check_circle</mat-icon>
              API Key configurada. Deixe vazio para manter, preencha para substituir.
            </mat-hint>
            <button
              *ngIf="data.mode === 'edit' && hasApiKey"
              mat-icon-button
              matSuffix
              type="button"
              (click)="clearApiKey()"
              [disabled]="saving"
              matTooltip="Limpar API Key (remover)"
              data-testid="connector-dialog.clearApiKey">
              <mat-icon>backspace</mat-icon>
            </button>
          </mat-form-field>
        </div>

        <!-- BASIC config -->
        <div *ngIf="form.get('authType')?.value === 'BASIC'" class="auth-section">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Usuário</mat-label>
            <input
              matInput
              formControlName="basicUsername"
              placeholder="ex: admin"
              data-testid="connector-dialog.basicUsername">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Senha</mat-label>
            <input
              matInput
              type="password"
              formControlName="basicPassword"
              placeholder="Senha"
              data-testid="connector-dialog.basicPassword"
              autocomplete="new-password">
            <mat-hint *ngIf="data.mode === 'edit' && hasBasicPassword" class="secret-configured">
              <mat-icon class="hint-icon">check_circle</mat-icon>
              Senha configurada. Deixe vazio para manter, preencha para substituir.
            </mat-hint>
            <button
              *ngIf="data.mode === 'edit' && hasBasicPassword"
              mat-icon-button
              matSuffix
              type="button"
              (click)="clearBasicPassword()"
              [disabled]="saving"
              matTooltip="Limpar senha (remover)"
              data-testid="connector-dialog.clearBasicPassword">
              <mat-icon>backspace</mat-icon>
            </button>
          </mat-form-field>
        </div>

        <!-- Request Defaults (collapsible) -->
        <mat-expansion-panel class="defaults-panel">
          <mat-expansion-panel-header>
            <mat-panel-title>Request Defaults (opcional)</mat-panel-title>
          </mat-expansion-panel-header>

          <div class="defaults-content" formGroupName="requestDefaults">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Método Padrão</mat-label>
              <mat-select formControlName="method" data-testid="connector-dialog.requestDefaults.method">
                <mat-option [value]="null">— Nenhum —</mat-option>
                <mat-option value="GET">GET</mat-option>
                <mat-option value="POST">POST</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Content-Type Padrão</mat-label>
              <input
                matInput
                formControlName="contentType"
                placeholder="ex: application/json"
                data-testid="connector-dialog.requestDefaults.contentType">
            </mat-form-field>

            <!-- Headers KV -->
            <div class="kv-section">
              <div class="kv-header">
                <span>Headers Padrão</span>
                <button mat-icon-button type="button" (click)="addHeader()" matTooltip="Adicionar header">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
              <div formArrayName="headers" class="kv-list">
                <div *ngFor="let header of headersArray.controls; let i = index" [formGroupName]="i" class="kv-row">
                  <mat-form-field appearance="outline" class="kv-key">
                    <mat-label>Key</mat-label>
                    <input matInput formControlName="key" placeholder="Header name">
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="kv-value">
                    <mat-label>Value</mat-label>
                    <input matInput formControlName="value" placeholder="Header value">
                  </mat-form-field>
                  <button mat-icon-button type="button" (click)="removeHeader(i)" color="warn">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </div>

            <!-- Query Params KV -->
            <div class="kv-section">
              <div class="kv-header">
                <span>Query Params Padrão</span>
                <button mat-icon-button type="button" (click)="addQueryParam()" matTooltip="Adicionar query param">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
              <div formArrayName="queryParams" class="kv-list">
                <div *ngFor="let param of queryParamsArray.controls; let i = index" [formGroupName]="i" class="kv-row">
                  <mat-form-field appearance="outline" class="kv-key">
                    <mat-label>Key</mat-label>
                    <input matInput formControlName="key" placeholder="Param name">
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="kv-value">
                    <mat-label>Value</mat-label>
                    <input matInput formControlName="value" placeholder="Param value">
                  </mat-form-field>
                  <button mat-icon-button type="button" (click)="removeQueryParam(i)" color="warn">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </div>

            <!-- Body default -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Body Padrão (JSON)</mat-label>
              <textarea
                matInput
                formControlName="body"
                rows="4"
                placeholder='{"key": "value"}'
                data-testid="connector-dialog.requestDefaults.body">
              </textarea>
              <mat-hint>JSON a ser enviado por padrão (somente POST)</mat-hint>
            </mat-form-field>
          </div>
        </mat-expansion-panel>
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
      min-width: 500px;
      max-width: 600px;
    }

    .full-width {
      width: 100%;
    }

    mat-spinner {
      margin-right: 8px;
    }

    .secret-configured {
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

    .auth-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background: var(--mat-sys-surface-variant);
      border-radius: 8px;
    }

    .defaults-panel {
      margin-top: 8px;
    }

    .defaults-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-top: 12px;
    }

    .kv-section {
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 8px;
      padding: 12px;
    }

    .kv-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .kv-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .kv-row {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .kv-key {
      flex: 1;
    }

    .kv-value {
      flex: 2;
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

  // Secret indicators (read-only from API)
  hasApiToken = false;
  hasApiKey = false;
  hasBasicPassword = false;

  // Track if user explicitly cleared a secret
  clearingApiToken = false;
  clearingApiKey = false;
  clearingBasicPassword = false;

  ngOnInit(): void {
    this.initForm();

    if (this.data.mode === 'edit' && this.data.connector) {
      this.hasApiToken = this.data.connector.hasApiToken || false;
      this.hasApiKey = this.data.connector.hasApiKey || false;
      this.hasBasicPassword = this.data.connector.hasBasicPassword || false;
      this.patchForm(this.data.connector);
    }
  }

  get headersArray(): FormArray {
    return this.form.get('requestDefaults.headers') as FormArray;
  }

  get queryParamsArray(): FormArray {
    return this.form.get('requestDefaults.queryParams') as FormArray;
  }

  addHeader(): void {
    this.headersArray.push(this.fb.group({ key: [''], value: [''] }));
  }

  removeHeader(index: number): void {
    this.headersArray.removeAt(index);
  }

  addQueryParam(): void {
    this.queryParamsArray.push(this.fb.group({ key: [''], value: [''] }));
  }

  removeQueryParam(index: number): void {
    this.queryParamsArray.removeAt(index);
  }

  clearApiToken(): void {
    this.clearingApiToken = true;
    this.form.patchValue({ apiToken: '' });
  }

  clearApiKey(): void {
    this.clearingApiKey = true;
    this.form.patchValue({ apiKeyValue: '' });
  }

  clearBasicPassword(): void {
    this.clearingBasicPassword = true;
    this.form.patchValue({ basicPassword: '' });
  }

  save(): void {
    if (!this.form.valid || this.saving) return;

    this.saving = true;
    const formValue = this.form.getRawValue();

    const dto: ConnectorDto = {
      id: formValue.id,
      name: formValue.name,
      baseUrl: formValue.baseUrl,
      timeoutSeconds: formValue.timeoutSeconds,
      enabled: true,
      authType: formValue.authType as AuthType
    };

    // Auth-specific fields
    if (formValue.authType === 'API_KEY') {
      dto.apiKeyLocation = formValue.apiKeyLocation as ApiKeyLocation;
      dto.apiKeyName = formValue.apiKeyName;
    }

    if (formValue.authType === 'BASIC') {
      dto.basicUsername = formValue.basicUsername;
    }

    // Secrets with *Specified semantics
    this.applySecretSemantics(dto, formValue);

    // Request defaults
    const requestDefaults = this.buildRequestDefaults(formValue.requestDefaults);
    if (requestDefaults) {
      dto.requestDefaults = requestDefaults;
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

  private applySecretSemantics(dto: ConnectorDto, formValue: any): void {
    // apiToken (BEARER)
    if (formValue.authType === 'BEARER') {
      const token = formValue.apiToken?.trim();
      if (this.clearingApiToken) {
        dto.apiTokenSpecified = true;
        dto.apiToken = null;
      } else if (token && token.length > 0) {
        dto.apiTokenSpecified = true;
        dto.apiToken = token;
      }
      // else: don't send *Specified (keep existing)
    }

    // apiKeyValue (API_KEY)
    if (formValue.authType === 'API_KEY') {
      const keyValue = formValue.apiKeyValue?.trim();
      if (this.clearingApiKey) {
        dto.apiKeySpecified = true;
        dto.apiKeyValue = null;
      } else if (keyValue && keyValue.length > 0) {
        dto.apiKeySpecified = true;
        dto.apiKeyValue = keyValue;
      }
    }

    // basicPassword (BASIC)
    if (formValue.authType === 'BASIC') {
      const password = formValue.basicPassword?.trim();
      if (this.clearingBasicPassword) {
        dto.basicPasswordSpecified = true;
        dto.basicPassword = null;
      } else if (password && password.length > 0) {
        dto.basicPasswordSpecified = true;
        dto.basicPassword = password;
      }
    }
  }

  private buildRequestDefaults(defaults: any): RequestDefaults | undefined {
    if (!defaults) return undefined;

    const result: RequestDefaults = {};
    let hasContent = false;

    if (defaults.method) {
      result.method = defaults.method;
      hasContent = true;
    }

    if (defaults.contentType?.trim()) {
      result.contentType = defaults.contentType.trim();
      hasContent = true;
    }

    // Headers
    const headers = this.kvArrayToRecord(defaults.headers);
    if (headers && Object.keys(headers).length > 0) {
      result.headers = headers;
      hasContent = true;
    }

    // Query params
    const queryParams = this.kvArrayToRecord(defaults.queryParams);
    if (queryParams && Object.keys(queryParams).length > 0) {
      result.queryParams = queryParams;
      hasContent = true;
    }

    // Body
    if (defaults.body?.trim()) {
      try {
        result.body = JSON.parse(defaults.body.trim());
        hasContent = true;
      } catch {
        // If not valid JSON, send as string
        result.body = defaults.body.trim();
        hasContent = true;
      }
    }

    return hasContent ? result : undefined;
  }

  private kvArrayToRecord(array: { key: string; value: string }[]): Record<string, string> | null {
    if (!array || array.length === 0) return null;

    const result: Record<string, string> = {};
    for (const item of array) {
      const key = item.key?.trim();
      if (key) {
        result[key] = item.value?.trim() || '';
      }
    }

    return Object.keys(result).length > 0 ? result : null;
  }

  private initForm(): void {
    const urlPattern = /^https?:\/\/.+/;

    this.form = this.fb.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      baseUrl: ['', [Validators.required, Validators.pattern(urlPattern)]],
      timeoutSeconds: [60, [Validators.required, Validators.min(1)]],
      authType: ['NONE'],

      // BEARER
      apiToken: ['', [Validators.maxLength(4096)]],

      // API_KEY
      apiKeyLocation: ['HEADER'],
      apiKeyName: [''],
      apiKeyValue: ['', [Validators.maxLength(4096)]],

      // BASIC
      basicUsername: [''],
      basicPassword: ['', [Validators.maxLength(4096)]],

      // Request defaults
      requestDefaults: this.fb.group({
        method: [null],
        contentType: [''],
        headers: this.fb.array([]),
        queryParams: this.fb.array([]),
        body: ['']
      })
    });
  }

  private patchForm(connector: ConnectorDto): void {
    this.form.patchValue({
      id: connector.id,
      name: connector.name,
      baseUrl: connector.baseUrl,
      timeoutSeconds: connector.timeoutSeconds,
      authType: connector.authType || 'NONE',
      apiKeyLocation: connector.apiKeyLocation || 'HEADER',
      apiKeyName: connector.apiKeyName || '',
      basicUsername: connector.basicUsername || '',
      // Secrets are ALWAYS empty in edit (write-only)
      apiToken: '',
      apiKeyValue: '',
      basicPassword: ''
    });

    // Patch request defaults
    if (connector.requestDefaults) {
      this.form.patchValue({
        requestDefaults: {
          method: connector.requestDefaults.method || null,
          contentType: connector.requestDefaults.contentType || '',
          body: connector.requestDefaults.body
            ? (typeof connector.requestDefaults.body === 'string'
                ? connector.requestDefaults.body
                : JSON.stringify(connector.requestDefaults.body, null, 2))
            : ''
        }
      });

      // Patch headers
      if (connector.requestDefaults.headers) {
        for (const [key, value] of Object.entries(connector.requestDefaults.headers)) {
          this.headersArray.push(this.fb.group({ key: [key], value: [value] }));
        }
      }

      // Patch query params
      if (connector.requestDefaults.queryParams) {
        for (const [key, value] of Object.entries(connector.requestDefaults.queryParams)) {
          this.queryParamsArray.push(this.fb.group({ key: [key], value: [value] }));
        }
      }
    }

    // Disable ID field in edit mode
    this.form.get('id')?.disable();
  }
}
