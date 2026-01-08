import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { JsonEditorLiteComponent } from '../../../shared/components/json-editor-lite/json-editor-lite.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { PreviewService } from '../../../core/services/api/preview.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { PreviewTransformResponse } from '../../../shared/models/preview.model';
import { DslProfile } from '../../../shared/models/process-version.model';
import { UiError } from '../../../shared/models/api-error.model';
import { safeJsonParse, tryExtractPlan } from '../../../shared/utils/normalizers';

/**
 * PreviewWorkbench - Página de preview de transformação
 * Conforme pages/preview-transform.md
 */
@Component({
  selector: 'ms-preview-workbench',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    JsonEditorLiteComponent,
    ErrorBannerComponent
  ],
  template: `
    <div class="preview-workbench" data-testid="page.preview">
      <ms-page-header
        title="Pré-visualizar Transformação"
        subtitle="Teste sua transformação DSL antes de salvar">
      </ms-page-header>

      <!-- Error Banner -->
      <ms-error-banner
        *ngIf="error"
        [error]="error"
        [visible]="true"
        (onRetry)="runPreview()"
        (onDismiss)="error = undefined">
      </ms-error-banner>

      <div class="workbench-layout">
        <!-- Input Panel -->
        <mat-card class="input-panel">
          <mat-card-header>
            <mat-card-title>Entrada</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <!-- DSL Profile - fixo 'ir' conforme specs/frontend/11-ui/ui-ai-assistant.md -->
            <div class="dsl-profile-info">
              <span>Perfil DSL: <strong>IR (Plan V1)</strong></span>
            </div>

            <!-- DSL Text (Plan JSON) -->
            <ms-json-editor-lite
              title="Plan IR (JSON)"
              [valueText]="dslText"
              mode="json"
              [height]="150"
              (onChange)="dslText = $event"
              testId="preview.dslText">
            </ms-json-editor-lite>

            <!-- Output Schema -->
            <ms-json-editor-lite
              title="Output Schema (JSON)"
              [valueText]="outputSchemaText"
              mode="json"
              [height]="150"
              [required]="true"
              (onChange)="outputSchemaText = $event"
              testId="preview.outputSchema">
            </ms-json-editor-lite>

            <!-- Sample Input -->
            <ms-json-editor-lite
              title="Sample Input (JSON)"
              [valueText]="sampleInputText"
              mode="json"
              [height]="200"
              [required]="true"
              (onChange)="sampleInputText = $event"
              testId="preview.sampleInput">
            </ms-json-editor-lite>

            <!-- Run Button -->
            <button
              mat-flat-button
              color="primary"
              class="run-button"
              [disabled]="!canPreview() || loading"
              (click)="runPreview()"
              data-testid="preview.run">
              <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
              <mat-icon *ngIf="!loading">play_arrow</mat-icon>
              {{ loading ? 'Processando...' : 'Pré-visualizar' }}
            </button>
          </mat-card-content>
        </mat-card>

        <!-- Output Panel -->
        <mat-card class="output-panel">
          <mat-card-header>
            <mat-card-title>Resultado</mat-card-title>
            <div class="result-status" *ngIf="result">
              <span class="status-badge" [class.valid]="result.isValid" [class.invalid]="!result.isValid">
                {{ result.isValid ? 'Válido' : 'Inválido' }}
              </span>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="!result" class="empty-result">
              <mat-icon>preview</mat-icon>
              <p>Execute a transformação para ver o resultado</p>
            </div>

            <mat-tab-group *ngIf="result">
              <mat-tab label="Resultado JSON">
                <pre class="result-output">{{ result.output | json }}</pre>
              </mat-tab>

              <mat-tab label="Visualização CSV" *ngIf="result.previewCsv">
                <pre class="result-output csv-output">{{ result.previewCsv }}</pre>
              </mat-tab>

              <mat-tab label="Erros" *ngIf="result.errors && result.errors.length > 0">
                <div class="errors-list">
                  <div *ngFor="let err of result.errors" class="error-item">
                    <strong>{{ err.path }}</strong>
                    <span>{{ err.message }}</span>
                    <code *ngIf="err.kind">{{ err.kind }}</code>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .preview-workbench {
      max-width: 1400px;
      margin: 0 auto;
    }

    .workbench-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    @media (max-width: 1024px) {
      .workbench-layout {
        grid-template-columns: 1fr;
      }
    }

    .input-panel, .output-panel {
      height: fit-content;
    }

    .input-panel mat-card-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .dsl-profile-info {
      padding: 8px 12px;
      background: var(--mat-sys-surface-variant);
      border-radius: 4px;
      margin-bottom: 12px;
      font-size: 14px;
      color: var(--mat-sys-on-surface-variant);
    }

    .run-button {
      align-self: flex-start;
    }

    .output-panel mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.valid {
      background: #D4EDDA;
      color: #155724;
    }

    .status-badge.invalid {
      background: #F8D7DA;
      color: #721C24;
    }

    .empty-result {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      color: var(--mat-sys-on-surface-variant);
    }

    .empty-result mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .result-output {
      padding: 16px;
      background: #F5F5F5;
      border-radius: 8px;
      overflow-x: auto;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 13px;
      max-height: 400px;
      margin: 16px 0;
    }

    .csv-output {
      white-space: pre;
    }

    .errors-list {
      padding: 16px;
    }

    .error-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px;
      background: #FFEBEE;
      border-radius: 8px;
      margin-bottom: 8px;
    }

    .error-item strong {
      color: #C62828;
    }

    .error-item code {
      font-size: 11px;
      background: #FFCDD2;
      padding: 2px 6px;
      border-radius: 4px;
      align-self: flex-start;
    }
  `]
})
export class PreviewWorkbenchComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly previewService = inject(PreviewService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly snackbar = inject(SnackbarService);

  // DSL profile fixo 'ir' conforme specs/frontend/11-ui/ui-ai-assistant.md
  dslText = '';
  outputSchemaText = '{}';
  sampleInputText = '';
  /** Plan recebido via query params ou extraído do dsl.text */
  plan: unknown | null = null;

  loading = false;
  result: PreviewTransformResponse | null = null;
  error?: UiError;

  ngOnInit(): void {
    // Check for prefill from query params (from VersionEditor)
    const queryParams = this.route.snapshot.queryParams;
    // dslProfile é ignorado - sempre 'ir'
    if (queryParams['dslText']) {
      this.dslText = queryParams['dslText'];
    }
    if (queryParams['outputSchema']) {
      this.outputSchemaText = queryParams['outputSchema'];
    }
    if (queryParams['sampleInput']) {
      this.sampleInputText = queryParams['sampleInput'];
    }
    // Tentar extrair plan do dslText se não vier via query param
    if (queryParams['plan']) {
      try {
        this.plan = JSON.parse(queryParams['plan']);
      } catch {
        this.plan = null;
      }
    } else if (this.dslText) {
      this.plan = tryExtractPlan('ir', this.dslText);
    }
  }

  canPreview(): boolean {
    return this.dslText.trim() !== '' &&
           this.outputSchemaText.trim() !== '' &&
           this.sampleInputText.trim() !== '';
  }

  runPreview(): void {
    if (!this.canPreview()) return;

    // Validate JSON fields
    const outputSchemaResult = safeJsonParse(this.outputSchemaText);
    if (!outputSchemaResult.success) {
      this.snackbar.error('Output Schema inválido. Verifique o JSON.');
      return;
    }

    const sampleInputResult = safeJsonParse(this.sampleInputText);
    if (!sampleInputResult.success) {
      this.snackbar.error('Sample Input inválido. Verifique o JSON.');
      return;
    }

    this.loading = true;
    this.result = null;
    this.error = undefined;

    // Conforme specs/frontend/11-ui/pages/preview-transform.md:
    // - Se tiver plan em memória, enviar
    // - Se não tiver, tentar extrair de dsl.text
    let planToSend = this.plan;
    if (!planToSend) {
      planToSend = tryExtractPlan('ir', this.dslText);
    }

    this.previewService.transform({
      sampleInput: sampleInputResult.data,
      dsl: {
        profile: 'ir',
        text: this.dslText
      },
      outputSchema: outputSchemaResult.data,
      plan: planToSend
    }).subscribe({
      next: (response) => {
        this.result = response;
        this.loading = false;

        // Conforme spec: isValid=false é erro de validação, não exception
        if (response.isValid) {
          this.snackbar.success('Transformação executada com sucesso!');
        } else {
          this.snackbar.warning('Transformação executada com erros de validação.');
        }
      },
      error: (err) => {
        this.error = this.errorHandler.handleHttpError(err);
        this.loading = false;
      }
    });
  }
}
