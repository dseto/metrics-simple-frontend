import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PageHeaderComponent, BreadcrumbItem } from '../../../shared/components/page-header/page-header.component';
import { FormFooterComponent } from '../../../shared/components/form-footer/form-footer.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { SkeletonFormComponent } from '../../../shared/components/skeleton-form/skeleton-form.component';
import { JsonEditorLiteComponent } from '../../../shared/components/json-editor-lite/json-editor-lite.component';
import { KeyValueEditorComponent, KeyValueItem } from '../../../shared/components/key-value-editor/key-value-editor.component';
import { VersionsService } from '../../../core/services/api/versions.service';
import { PreviewService } from '../../../core/services/api/preview.service';
import { AiService } from '../../../core/services/api/ai.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { HasUnsavedChanges } from '../../../core/guards/unsaved-changes.guard';
import { ProcessVersionDto, HttpMethod, DslProfile, createDefaultProcessVersion } from '../../../shared/models/process-version.model';
import { PreviewTransformResponse } from '../../../shared/models/preview.model';
import { DslGenerateRequest, DslGenerateResult, DslGenerateConstraints, AiAssistantState, createDefaultConstraints } from '../../../shared/models/ai.model';
import { UiError, PageState } from '../../../shared/models/api-error.model';
import { recordToKeyValueArray, keyValueArrayToRecord, safeJsonParse, formatJson, tryExtractPlan } from '../../../shared/utils/normalizers';

/**
 * VersionEditor - Criar/Editar versão de processo
 * Conforme pages/version-editor.md
 */
@Component({
  selector: 'ms-version-editor',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    PageHeaderComponent,
    FormFooterComponent,
    ErrorBannerComponent,
    SkeletonFormComponent,
    JsonEditorLiteComponent,
    KeyValueEditorComponent
  ],
  template: `
    <div class="version-editor" data-testid="page.version-editor">
      <ms-page-header
        [title]="isEditMode ? 'Editar Versão v' + versionNumber : 'Nova Versão'"
        [breadcrumbs]="breadcrumbs"
        [dirty]="isDirty"
        (onAction)="handleHeaderAction($event)">
      </ms-page-header>

      <!-- Error Banner -->
      <ms-error-banner
        *ngIf="state.kind === 'error'"
        [error]="state.error"
        [visible]="true"
        (onRetry)="loadData()"
        (onDismiss)="dismissError()">
      </ms-error-banner>

      <!-- Loading -->
      <ms-skeleton-form
        *ngIf="state.kind === 'loading'"
        [fieldCount]="8"
        testId="version-editor.skeleton">
      </ms-skeleton-form>

      <!-- Form -->
      <form *ngIf="state.kind === 'ready' || state.kind === 'saving'" [formGroup]="form" class="editor-form">
        <!-- Basic Info -->
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Informações Básicas</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <!-- Version Number (only for create) -->
            <mat-form-field *ngIf="!isEditMode" appearance="outline" class="full-width">
              <mat-label>Número da Versão</mat-label>
              <input
                matInput
                type="number"
                formControlName="version"
                min="1"
                data-testid="version-editor.version">
              <mat-error *ngIf="form.get('version')?.hasError('required')">Campo obrigatório.</mat-error>
              <mat-error *ngIf="form.get('version')?.hasError('min')">Informe um número inteiro ≥ 1.</mat-error>
            </mat-form-field>

            <!-- Enabled -->
            <mat-slide-toggle
              formControlName="enabled"
              data-testid="version-editor.enabled">
              Versão habilitada
            </mat-slide-toggle>
          </mat-card-content>
        </mat-card>

        <!-- Source Request -->
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Requisição de Origem</mat-card-title>
          </mat-card-header>
          <mat-card-content formGroupName="sourceRequest">
            <div class="source-request-row">
              <mat-form-field appearance="outline" class="method-field">
                <mat-label>Método</mat-label>
                <mat-select formControlName="method" data-testid="version-editor.method">
                  <mat-option value="GET">GET</mat-option>
                  <mat-option value="POST">POST</mat-option>
                  <mat-option value="PUT">PUT</mat-option>
                  <mat-option value="DELETE">DELETE</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="path-field">
                <mat-label>Path</mat-label>
                <input
                  matInput
                  formControlName="path"
                  placeholder="/api/data"
                  data-testid="version-editor.path">
                <mat-error *ngIf="form.get('sourceRequest.path')?.hasError('required')">Campo obrigatório.</mat-error>
              </mat-form-field>
            </div>

            <!-- Headers -->
            <ms-key-value-editor
              title="Headers"
              [value]="headersItems"
              placeholderKey="Header"
              placeholderValue="Valor"
              (onChange)="onHeadersChange($event)"
              testId="version-editor.headers">
            </ms-key-value-editor>

            <!-- Query Params -->
            <ms-key-value-editor
              title="Query Parameters"
              [value]="queryParamsItems"
              placeholderKey="Parâmetro"
              placeholderValue="Valor"
              (onChange)="onQueryParamsChange($event)"
              testId="version-editor.queryParams">
            </ms-key-value-editor>

            <!-- Body (for POST/PUT) -->
            <div *ngIf="showBodyField()" class="body-section">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Content-Type</mat-label>
                <input
                  matInput
                  formControlName="contentType"
                  placeholder="application/json"
                  data-testid="version-editor.contentType">
                <mat-hint>Tipo de conteúdo do body (ex.: application/json)</mat-hint>
              </mat-form-field>

              <ms-json-editor-lite
                title="Request Body (JSON)"
                [valueText]="bodyText"
                mode="json"
                [height]="150"
                (onChange)="onBodyChange($event)"
                testId="version-editor.body">
              </ms-json-editor-lite>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- DSL & Schema -->
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Transformação (IR/PlanV1)</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <!-- DSL Profile - fixo 'ir' conforme specs/frontend/11-ui/ui-ai-assistant.md -->
            <div class="dsl-profile-info">
              <mat-icon>code</mat-icon>
              <span>Perfil DSL: <strong>IR (Plan V1)</strong></span>
            </div>

            <!-- DSL Text (Plan JSON) -->
            <ms-json-editor-lite
              title="Plan IR (JSON)"
              [valueText]="dslText"
              mode="json"
              [height]="200"
              (onChange)="onDslTextChange($event)"
              testId="version-editor.dslText">
            </ms-json-editor-lite>

            <!-- Output Schema -->
            <ms-json-editor-lite
              title="Output Schema (JSON)"
              [valueText]="outputSchemaText"
              mode="json"
              [height]="200"
              [required]="true"
              (onChange)="onOutputSchemaChange($event)"
              testId="version-editor.outputSchema">
            </ms-json-editor-lite>

            <!-- Sample Input -->
            <ms-json-editor-lite
              title="Sample Input (JSON, opcional)"
              [valueText]="sampleInputText"
              mode="json"
              [height]="150"
              (onChange)="onSampleInputChange($event)"
              testId="version-editor.sampleInput">
            </ms-json-editor-lite>
          </mat-card-content>
        </mat-card>

        <!-- AI Assistant -->
        <mat-expansion-panel class="ai-panel">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>auto_awesome</mat-icon>
              Assistente IA
            </mat-panel-title>
            <mat-panel-description>
              Gere DSL e Schema automaticamente
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div class="ai-content">
            <!-- AI Disabled Banner -->
            <div *ngIf="aiState === 'disabled'" class="ai-disabled-banner">
              <mat-icon>info</mat-icon>
              <span>IA desabilitada nesta instalação.</span>
            </div>

            <!-- AI Form -->
            <div *ngIf="aiState !== 'disabled'" class="ai-form">
              <!-- Goal Text -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Descreva o CSV desejado</mat-label>
                <textarea
                  matInput
                  [(ngModel)]="aiGoalText"
                  [ngModelOptions]="{standalone: true}"
                  rows="3"
                  minlength="10"
                  maxlength="4000"
                  placeholder="Ex: Gerar CSV com timestamp, hostName e cpuUsagePercent..."
                  data-testid="ai.goalText">
                </textarea>
                <mat-hint>Mín. 10 caracteres, máx. 4000</mat-hint>
              </mat-form-field>

              <!-- Hints (optional) -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Colunas desejadas (opcional)</mat-label>
                <input
                  matInput
                  [(ngModel)]="aiHintsColumns"
                  [ngModelOptions]="{standalone: true}"
                  maxlength="200"
                  placeholder="Ex: id, name, total"
                  data-testid="ai.hints.columns">
                <mat-hint>Lista de colunas separadas por vírgula (máx. 200 caracteres)</mat-hint>
              </mat-form-field>

              <!-- Constraints (Advanced section) -->
              <mat-expansion-panel class="constraints-panel">
                <mat-expansion-panel-header>
                  <mat-panel-title>Constraints (Avançado)</mat-panel-title>
                </mat-expansion-panel-header>
                <div class="constraints-content">
                  <mat-form-field appearance="outline" class="constraint-field">
                    <mat-label>Max Columns</mat-label>
                    <input
                      matInput
                      type="number"
                      [(ngModel)]="aiConstraints.maxColumns"
                      [ngModelOptions]="{standalone: true}"
                      min="1"
                      max="200"
                      data-testid="ai.constraints.maxColumns">
                    <mat-hint>1-200 (default: 50)</mat-hint>
                  </mat-form-field>

                  <div class="constraint-checkboxes">
                    <mat-checkbox
                      [(ngModel)]="aiConstraints.allowTransforms"
                      [ngModelOptions]="{standalone: true}"
                      data-testid="ai.constraints.allowTransforms">
                      Allow Transforms
                    </mat-checkbox>

                    <mat-checkbox
                      [(ngModel)]="aiConstraints.forbidNetworkCalls"
                      [ngModelOptions]="{standalone: true}"
                      [disabled]="true"
                      data-testid="ai.constraints.forbidNetworkCalls">
                      Forbid Network Calls (obrigatório)
                    </mat-checkbox>

                    <mat-checkbox
                      [(ngModel)]="aiConstraints.forbidCodeExecution"
                      [ngModelOptions]="{standalone: true}"
                      [disabled]="true"
                      data-testid="ai.constraints.forbidCodeExecution">
                      Forbid Code Execution (obrigatório)
                    </mat-checkbox>
                  </div>
                </div>
              </mat-expansion-panel>

              <div class="ai-actions">
                <button
                  mat-flat-button
                  color="primary"
                  [disabled]="!canGenerateAi()"
                  (click)="generateWithAi()"
                  data-testid="ai.generate">
                  <mat-spinner *ngIf="aiState === 'generating'" diameter="20"></mat-spinner>
                  <mat-icon *ngIf="aiState !== 'generating'">auto_awesome</mat-icon>
                  {{ aiState === 'generating' ? 'Gerando...' : 'Gerar' }}
                </button>

                <button
                  *ngIf="aiState === 'generated'"
                  mat-button
                  color="primary"
                  (click)="applyAiResult()"
                  data-testid="ai.apply">
                  <mat-icon>check</mat-icon>
                  Aplicar Sugestão
                </button>
              </div>

              <!-- AI Result -->
              <div *ngIf="aiState === 'generated' && aiResult" class="ai-result">
                <h4>Sugestão da IA</h4>
                <p class="ai-rationale">{{ aiResult.rationale }}</p>

                <!-- Plan Preview (read-only) -->
                <div *ngIf="aiResult.plan" class="ai-plan-preview">
                  <strong>Plan gerado:</strong>
                  <pre>{{ aiResult.plan | json }}</pre>
                </div>

                <div *ngIf="aiResult.warnings && aiResult.warnings.length > 0" class="ai-warnings">
                  <mat-icon>warning</mat-icon>
                  <ul>
                    <li *ngFor="let warning of aiResult.warnings">{{ warning }}</li>
                  </ul>
                </div>
              </div>

              <!-- AI Error -->
              <div *ngIf="aiState === 'failed'" class="ai-error">
                <mat-icon>error</mat-icon>
                <span>{{ aiErrorMessage }}</span>
              </div>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Preview Panel -->
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Preview</mat-card-title>
            <button
              mat-flat-button
              color="primary"
              [disabled]="!canPreview()"
              (click)="runPreview()"
              data-testid="version-editor.preview">
              <mat-spinner *ngIf="previewLoading" diameter="20"></mat-spinner>
              <mat-icon *ngIf="!previewLoading">play_arrow</mat-icon>
              Pré-visualizar
            </button>
          </mat-card-header>
          <mat-card-content>
            <mat-tab-group *ngIf="previewResult">
              <mat-tab label="Resultado JSON">
                <pre class="preview-output">{{ previewResult.output | json }}</pre>
              </mat-tab>
              <mat-tab label="Visualização CSV" *ngIf="previewResult.previewCsv">
                <pre class="preview-output">{{ previewResult.previewCsv }}</pre>
              </mat-tab>
              <mat-tab label="Erros" *ngIf="previewResult.errors && previewResult.errors.length > 0">
                <div class="preview-errors">
                  <div *ngFor="let error of previewResult.errors" class="preview-error-item">
                    <strong>{{ error.path }}</strong>: {{ error.message }}
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>

            <p *ngIf="!previewResult" class="preview-hint">
              Preencha os campos de DSL, Output Schema e Sample Input para visualizar o resultado.
            </p>
          </mat-card-content>
        </mat-card>

        <!-- Form Footer -->
        <ms-form-footer
          [primary]="{ id: 'save', label: isEditMode ? 'Salvar' : 'Criar', icon: 'save', variant: 'filled', loading: state.kind === 'saving', disabled: !form.valid }"
          [secondary]="[{ id: 'cancel', label: 'Cancelar', variant: 'text' }]"
          [sticky]="true"
          (onAction)="handleFooterAction($event)">
        </ms-form-footer>
      </form>
    </div>
  `,
  styles: [`
    .version-editor {
      max-width: 900px;
      margin: 0 auto;
    }

    .editor-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-card {
      margin-bottom: 0;
    }

    .form-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .full-width {
      width: 100%;
    }

    .source-request-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .method-field {
      width: 120px;
    }

    .path-field {
      flex: 1;
    }

    .body-section {
      margin-top: 16px;
      padding: 16px;
      background: var(--mat-sys-surface-variant);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .ai-panel {
      margin-bottom: 0;
    }

    .ai-panel mat-panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ai-content {
      padding: 16px 0;
    }

    .ai-disabled-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: #FFF3CD;
      border-radius: 8px;
      color: #856404;
    }

    .ai-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .ai-actions {
      display: flex;
      gap: 8px;
    }

    .ai-result {
      padding: 16px;
      background: #E8F5E9;
      border-radius: 8px;
    }

    .ai-result h4 {
      margin: 0 0 8px;
      color: #2E7D32;
    }

    .ai-rationale {
      margin: 0;
      color: #1B5E20;
    }

    .ai-warnings {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-top: 12px;
      padding: 12px;
      background: #FFF8E1;
      border-radius: 4px;
      color: #F57C00;
    }

    .ai-warnings ul {
      margin: 0;
      padding-left: 16px;
    }

    .ai-error {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: #FFEBEE;
      border-radius: 8px;
      color: #C62828;
    }

    .preview-output {
      padding: 16px;
      background: #F5F5F5;
      border-radius: 4px;
      overflow-x: auto;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 13px;
      max-height: 300px;
    }

    .preview-errors {
      padding: 16px;
    }

    .preview-error-item {
      padding: 8px;
      margin-bottom: 8px;
      background: #FFEBEE;
      border-radius: 4px;
      color: #C62828;
    }

    .preview-hint {
      color: var(--mat-sys-on-surface-variant);
      text-align: center;
      padding: 24px;
    }

    .dsl-profile-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: var(--mat-sys-surface-variant);
      border-radius: 8px;
      margin-bottom: 16px;
      color: var(--mat-sys-on-surface-variant);
    }

    .constraints-panel {
      margin-bottom: 16px;
    }

    .constraints-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }

    .constraint-field {
      max-width: 200px;
    }

    .constraint-checkboxes {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .ai-plan-preview {
      margin-top: 12px;
      padding: 12px;
      background: #E3F2FD;
      border-radius: 4px;
    }

    .ai-plan-preview pre {
      margin: 8px 0 0;
      font-size: 12px;
      max-height: 150px;
      overflow: auto;
    }
  `]
})
export class VersionEditorComponent implements OnInit, HasUnsavedChanges {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly versionsService = inject(VersionsService);
  private readonly previewService = inject(PreviewService);
  private readonly aiService = inject(AiService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly snackbar = inject(SnackbarService);

  form!: FormGroup;
  state: PageState = { kind: 'idle' };
  processId: string = '';
  versionNumber: number = 1;
  isEditMode = false;
  isDirty = false;

  // Text values for JSON editors
  dslText = '';
  outputSchemaText = '{}';
  sampleInputText = '';
  bodyText = '';

  // KeyValue items
  headersItems: KeyValueItem[] = [];
  queryParamsItems: KeyValueItem[] = [];

  // AI Assistant
  // Conforme specs/frontend/11-ui/ui-ai-assistant.md
  aiState: AiAssistantState = 'idle';
  aiGoalText = '';
  aiHintsColumns = '';
  aiConstraints: DslGenerateConstraints = createDefaultConstraints();
  aiResult: DslGenerateResult | null = null;
  aiErrorMessage = '';
  /** Plan gerado pela IA - preservar para preview */
  lastGeneratedPlan: unknown | null = null;

  // Preview
  previewLoading = false;
  previewResult: PreviewTransformResponse | null = null;

  breadcrumbs: BreadcrumbItem[] = [];

  ngOnInit(): void {
    this.processId = this.route.snapshot.paramMap.get('processId') || '';
    const versionParam = this.route.snapshot.paramMap.get('version');
    this.isEditMode = !!versionParam;
    this.versionNumber = versionParam ? parseInt(versionParam, 10) : 1;

    this.breadcrumbs = [
      { label: 'Processos', route: '/processes' },
      { label: this.processId, route: `/processes/${this.processId}` },
      { label: this.isEditMode ? `Versão ${this.versionNumber}` : 'Nova Versão' }
    ];

    this.initForm();
    this.loadData();

    this.form.valueChanges.subscribe(() => {
      this.isDirty = true;
    });
  }

  hasUnsavedChanges(): boolean {
    return this.isDirty;
  }

  loadData(): void {
    if (this.isEditMode) {
      this.state = { kind: 'loading' };
      this.versionsService.get(this.processId, this.versionNumber).subscribe({
        next: (version) => {
          this.patchForm(version);
          this.state = { kind: 'ready', dirty: false };
          this.isDirty = false;
        },
        error: (error) => {
          const uiError = this.errorHandler.handleHttpError(error);
          this.state = { kind: 'error', dirty: false, error: uiError };
        }
      });
    } else {
      this.state = { kind: 'ready', dirty: false };
    }
  }

  handleHeaderAction(actionId: string): void {
    // No header actions for now
  }

  handleFooterAction(actionId: string): void {
    if (actionId === 'save') {
      this.save();
    } else if (actionId === 'cancel') {
      this.cancel();
    }
  }

  save(): void {
    if (!this.form.valid) return;

    // Validate JSON fields
    const outputSchemaResult = safeJsonParse(this.outputSchemaText);
    if (!outputSchemaResult.success) {
      this.snackbar.error('Output Schema inválido. Verifique o JSON.');
      return;
    }

    let sampleInput = null;
    if (this.sampleInputText.trim()) {
      const sampleInputResult = safeJsonParse(this.sampleInputText);
      if (!sampleInputResult.success) {
        this.snackbar.error('Sample Input inválido. Verifique o JSON.');
        return;
      }
      sampleInput = sampleInputResult.data;
    }

    this.state = { kind: 'saving', dirty: true };
    const formValue = this.form.getRawValue();

    // Parse body if present
    let body = undefined;
    if (this.bodyText.trim()) {
      const bodyResult = safeJsonParse(this.bodyText);
      if (bodyResult.success) {
        body = bodyResult.data;
      } else {
        // Send as string if not valid JSON
        body = this.bodyText.trim();
      }
    }

    const dto: ProcessVersionDto = {
      processId: this.processId,
      version: formValue.version,
      enabled: formValue.enabled,
      sourceRequest: {
        method: formValue.sourceRequest.method,
        path: formValue.sourceRequest.path,
        headers: keyValueArrayToRecord(this.headersItems),
        queryParams: keyValueArrayToRecord(this.queryParamsItems),
        body: body,
        contentType: formValue.sourceRequest.contentType?.trim() || undefined
      },
      dsl: {
        profile: 'ir',  // Fixo 'ir' conforme specs/frontend/11-ui/ui-ai-assistant.md
        text: this.dslText
      },
      outputSchema: outputSchemaResult.data,
      sampleInput
    };

    const request = this.isEditMode
      ? this.versionsService.update(this.processId, this.versionNumber, dto)
      : this.versionsService.create(this.processId, dto);

    request.subscribe({
      next: (result) => {
        this.isDirty = false;
        this.snackbar.success(this.isEditMode ? 'Versão atualizada com sucesso.' : 'Versão criada com sucesso.');

        if (!this.isEditMode) {
          this.router.navigate(['/processes', this.processId, 'versions', result.version]);
        } else {
          this.state = { kind: 'ready', dirty: false };
        }
      },
      error: (error) => {
        const uiError = this.errorHandler.handleHttpError(error);
        this.errorHandler.showError(uiError);
        this.state = { kind: 'ready', dirty: true };
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/processes', this.processId]);
  }

  dismissError(): void {
    this.state = { kind: 'ready', dirty: this.isDirty };
  }

  // JSON Editor handlers
  onDslTextChange(value: string): void {
    this.dslText = value;
    this.isDirty = true;
  }

  onOutputSchemaChange(value: string): void {
    this.outputSchemaText = value;
    this.isDirty = true;
  }

  onSampleInputChange(value: string): void {
    this.sampleInputText = value;
    this.isDirty = true;
  }

  // KeyValue handlers
  onHeadersChange(items: KeyValueItem[]): void {
    this.headersItems = items;
    this.isDirty = true;
  }

  onQueryParamsChange(items: KeyValueItem[]): void {
    this.queryParamsItems = items;
    this.isDirty = true;
  }

  // Body handlers
  onBodyChange(value: string): void {
    this.bodyText = value;
    this.isDirty = true;
  }

  showBodyField(): boolean {
    const method = this.form.get('sourceRequest.method')?.value;
    return method === 'POST' || method === 'PUT';
  }

  // AI Assistant
  canGenerateAi(): boolean {
    return this.aiState !== 'generating' &&
           this.aiState !== 'disabled' &&
           this.aiGoalText.trim().length >= 10 &&
           this.sampleInputText.trim() !== '';
  }

  generateWithAi(): void {
    if (!this.canGenerateAi()) return;

    const sampleInputResult = safeJsonParse(this.sampleInputText);
    if (!sampleInputResult.success) {
      this.snackbar.error('Sample Input inválido. Verifique o JSON.');
      return;
    }

    this.aiState = 'generating';
    this.aiResult = null;
    this.aiErrorMessage = '';

    // Conforme specs/frontend/11-ui/ui-ai-assistant.md: dslProfile sempre 'ir'
    const request: DslGenerateRequest = {
      goalText: this.aiGoalText,
      sampleInput: sampleInputResult.data,
      dslProfile: 'ir',
      constraints: {
        ...this.aiConstraints,
        // Garantir que forbidNetworkCalls e forbidCodeExecution são sempre true
        forbidNetworkCalls: true,
        forbidCodeExecution: true
      },
      hints: this.aiHintsColumns.trim() ? { columns: this.aiHintsColumns.trim() } : null,
      existingDsl: this.dslText ? { profile: 'ir', text: this.dslText } : null,
      existingOutputSchema: this.outputSchemaText ? (safeJsonParse(this.outputSchemaText).success ? (safeJsonParse(this.outputSchemaText) as { success: true; data: unknown }).data : null) : null
    };

    this.aiService.generateDsl(request).subscribe({
      next: (result) => {
        this.aiResult = result;
        this.aiState = 'generated';
        // Preservar plan para preview (conforme spec)
        if (result.plan) {
          this.lastGeneratedPlan = result.plan;
        }
      },
      error: (error) => {
        const uiError = this.errorHandler.handleHttpError(error);

        // Check for AI-specific errors
        if (uiError.code === 'AI_DISABLED') {
          this.aiState = 'disabled';
        } else {
          this.aiState = 'failed';
          this.aiErrorMessage = uiError.message;
        }
      }
    });
  }

  applyAiResult(): void {
    if (!this.aiResult) return;

    this.dslText = this.aiResult.dsl.text;
    // Profile já é 'ir' fixo, não precisa atualizar form
    this.outputSchemaText = formatJson(this.aiResult.outputSchema);
    
    // Preservar plan para preview (conforme specs/frontend/11-ui/ui-ai-assistant.md)
    if (this.aiResult.plan) {
      this.lastGeneratedPlan = this.aiResult.plan;
    }
    
    this.isDirty = true;
    this.snackbar.success('Sugestão da IA aplicada.');
  }

  // Preview
  canPreview(): boolean {
    return !this.previewLoading &&
           this.dslText.trim() !== '' &&
           this.outputSchemaText.trim() !== '' &&
           this.sampleInputText.trim() !== '';
  }

  runPreview(): void {
    if (!this.canPreview()) return;

    const outputSchemaResult = safeJsonParse(this.outputSchemaText);
    const sampleInputResult = safeJsonParse(this.sampleInputText);

    if (!outputSchemaResult.success) {
      this.snackbar.error('Output Schema inválido.');
      return;
    }

    if (!sampleInputResult.success) {
      this.snackbar.error('Sample Input inválido.');
      return;
    }

    this.previewLoading = true;
    this.previewResult = null;

    // Conforme specs/frontend/11-ui/pages/preview-transform.md:
    // - Se tiver plan em memória, enviar
    // - Se não tiver e profile === 'ir', tentar extrair de dsl.text
    let plan = this.lastGeneratedPlan;
    if (!plan) {
      plan = tryExtractPlan('ir', this.dslText);
    }

    this.previewService.transform({
      sampleInput: sampleInputResult.data,
      dsl: {
        profile: 'ir',
        text: this.dslText
      },
      outputSchema: outputSchemaResult.data,
      plan: plan
    }).subscribe({
      next: (result) => {
        this.previewResult = result;
        this.previewLoading = false;
        
        // Conforme spec: isValid=false é erro de validação, não exception
        if (result.isValid) {
          this.snackbar.success('Preview executado com sucesso.');
        } else {
          this.snackbar.warning('Preview executado com erros de validação.');
        }
      },
      error: (error) => {
        const uiError = this.errorHandler.handleHttpError(error);
        this.errorHandler.showError(uiError);
        this.previewLoading = false;
      }
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      version: [1, [Validators.required, Validators.min(1)]],
      enabled: [true],
      sourceRequest: this.fb.group({
        method: ['GET', Validators.required],
        path: ['', Validators.required],
        contentType: ['']
      })
      // DSL profile é fixo 'ir', não precisa de form control
    });
  }

  private patchForm(version: ProcessVersionDto): void {
    this.form.patchValue({
      version: version.version,
      enabled: version.enabled,
      sourceRequest: {
        method: version.sourceRequest.method,
        path: version.sourceRequest.path,
        contentType: version.sourceRequest.contentType || ''
      }
      // DSL profile é fixo 'ir', não precisa de patch
    });

    // Disable version field in edit mode
    this.form.get('version')?.disable();

    // Set text values
    this.dslText = version.dsl.text;
    this.outputSchemaText = formatJson(version.outputSchema);
    this.sampleInputText = version.sampleInput ? formatJson(version.sampleInput) : '';

    // Tentar extrair plan de dsl.text se profile === 'ir'
    // Conforme specs/frontend/11-ui/ui-ai-assistant.md
    if (version.dsl.profile === 'ir' && version.dsl.text) {
      this.lastGeneratedPlan = tryExtractPlan('ir', version.dsl.text);
    }

    // Set body text
    if (version.sourceRequest.body !== undefined && version.sourceRequest.body !== null) {
      this.bodyText = typeof version.sourceRequest.body === 'string'
        ? version.sourceRequest.body
        : formatJson(version.sourceRequest.body);
    } else {
      this.bodyText = '';
    }

    // Set KeyValue items
    this.headersItems = recordToKeyValueArray(version.sourceRequest.headers);
    this.queryParamsItems = recordToKeyValueArray(version.sourceRequest.queryParams);
  }
}
