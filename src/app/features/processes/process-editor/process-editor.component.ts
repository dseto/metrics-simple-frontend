import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { PageHeaderComponent, BreadcrumbItem, ActionButton } from '../../../shared/components/page-header/page-header.component';
import { FormFooterComponent, FooterAction } from '../../../shared/components/form-footer/form-footer.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { SkeletonFormComponent } from '../../../shared/components/skeleton-form/skeleton-form.component';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ProcessesService } from '../../../core/services/api/processes.service';
import { ConnectorsService } from '../../../core/services/api/connectors.service';
import { VersionsService } from '../../../core/services/api/versions.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { HasUnsavedChanges } from '../../../core/guards/unsaved-changes.guard';
import { ProcessDto, ProcessStatus, OutputDestination, createDefaultProcess } from '../../../shared/models/process.model';
import { ConnectorDto } from '../../../shared/models/connector.model';
import { ProcessVersionDto } from '../../../shared/models/process-version.model';
import { UiError, PageState } from '../../../shared/models/api-error.model';

/**
 * ProcessEditor - Criar/Editar processo
 * Conforme pages/process-editor.md
 */
@Component({
  selector: 'ms-process-editor',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatRadioModule,
    MatExpansionModule,
    MatTableModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    FormFooterComponent,
    ErrorBannerComponent,
    SkeletonFormComponent,
    StatusChipComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="process-editor" data-testid="page.process-editor">
      <ms-page-header
        [title]="isEditMode ? 'Editar Processo' : 'Novo Processo'"
        [breadcrumbs]="breadcrumbs"
        [dirty]="isDirty"
        [secondaryActions]="isEditMode ? [{ id: 'delete', label: 'Excluir', icon: 'delete', variant: 'text' }] : []"
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
        [fieldCount]="6"
        testId="process-editor.skeleton">
      </ms-skeleton-form>

      <!-- Form -->
      <form *ngIf="state.kind === 'ready' || state.kind === 'saving'" [formGroup]="form" class="editor-form">
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Informações Básicas</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <!-- ID (only for create) -->
            <mat-form-field *ngIf="!isEditMode" appearance="outline" class="full-width">
              <mat-label>ID do Processo</mat-label>
              <input
                matInput
                formControlName="id"
                placeholder="ex: sales-metrics"
                data-testid="process-editor.id">
              <mat-hint>Identificador único do processo</mat-hint>
              <mat-error *ngIf="form.get('id')?.hasError('required')">Campo obrigatório.</mat-error>
            </mat-form-field>

            <!-- Name -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nome do Processo</mat-label>
              <input
                matInput
                formControlName="name"
                placeholder="ex: Métricas de Vendas"
                data-testid="process-editor.name">
              <mat-error *ngIf="form.get('name')?.hasError('required')">Campo obrigatório.</mat-error>
            </mat-form-field>

            <!-- Description -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descrição</mat-label>
              <textarea
                matInput
                formControlName="description"
                rows="3"
                placeholder="Descreva o propósito deste processo..."
                data-testid="process-editor.description">
              </textarea>
            </mat-form-field>

            <!-- Status -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status" data-testid="process-editor.status">
                <mat-option value="Draft">Rascunho</mat-option>
                <mat-option value="Active">Ativo</mat-option>
                <mat-option value="Disabled">Desativado</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Connector -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Conector</mat-label>
              <mat-select formControlName="connectorId" data-testid="process-editor.connectorId">
                <mat-option *ngFor="let connector of connectors" [value]="connector.id">
                  {{ connector.name }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="form.get('connectorId')?.hasError('required')">Campo obrigatório.</mat-error>
              <mat-hint>
                <a routerLink="/connectors" class="hint-link">Gerenciar conectores</a>
              </mat-hint>
            </mat-form-field>
          </mat-card-content>
        </mat-card>

        <!-- Output Destinations -->
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Destinos de Saída</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div formArrayName="outputDestinations" class="destinations-list">
              <div
                *ngFor="let dest of destinationsArray.controls; let i = index"
                [formGroupName]="i"
                class="destination-item">

                <mat-radio-group formControlName="type" class="destination-type">
                  <mat-radio-button value="LocalFileSystem">Sistema de Arquivos Local</mat-radio-button>
                  <mat-radio-button value="AzureBlobStorage">Azure Blob Storage</mat-radio-button>
                </mat-radio-group>

                <!-- LocalFileSystem fields -->
                <div *ngIf="dest.get('type')?.value === 'LocalFileSystem'" class="destination-fields" formGroupName="local">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Caminho Base</mat-label>
                    <input
                      matInput
                      formControlName="basePath"
                      placeholder="/data/output"
                      [attr.data-testid]="'process-editor.dest.' + i + '.basePath'">
                    <mat-error>Campo obrigatório.</mat-error>
                  </mat-form-field>
                </div>

                <!-- AzureBlobStorage fields -->
                <div *ngIf="dest.get('type')?.value === 'AzureBlobStorage'" class="destination-fields" formGroupName="blob">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Connection String Ref</mat-label>
                    <input
                      matInput
                      formControlName="connectionStringRef"
                      placeholder="AZURE_STORAGE_CONNECTION_STRING"
                      [attr.data-testid]="'process-editor.dest.' + i + '.connectionStringRef'">
                    <mat-error>Campo obrigatório.</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Container</mat-label>
                    <input
                      matInput
                      formControlName="container"
                      placeholder="metrics-output"
                      [attr.data-testid]="'process-editor.dest.' + i + '.container'">
                    <mat-error>Campo obrigatório.</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Path Prefix (opcional)</mat-label>
                    <input
                      matInput
                      formControlName="pathPrefix"
                      placeholder="sales/"
                      [attr.data-testid]="'process-editor.dest.' + i + '.pathPrefix'">
                  </mat-form-field>
                </div>

                <button
                  *ngIf="destinationsArray.length > 1"
                  mat-icon-button
                  color="warn"
                  type="button"
                  (click)="removeDestination(i)"
                  aria-label="Remover destino"
                  [attr.data-testid]="'process-editor.dest.' + i + '.remove'">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>

            <button
              mat-button
              color="primary"
              type="button"
              (click)="addDestination()"
              data-testid="process-editor.addDestination">
              <mat-icon>add</mat-icon>
              Adicionar Destino
            </button>
          </mat-card-content>
        </mat-card>

        <!-- Versions (only for edit mode) -->
        <mat-card *ngIf="isEditMode" class="form-card">
          <mat-card-header>
            <mat-card-title>Versões</mat-card-title>
            <button
              mat-button
              color="primary"
              [routerLink]="['/processes', processId, 'versions', 'new']"
              data-testid="process-editor.newVersion">
              <mat-icon>add</mat-icon>
              Nova Versão
            </button>
          </mat-card-header>
          <mat-card-content>
            <!-- Loading -->
            <div *ngIf="versionsLoading" class="versions-loading">
              <mat-spinner diameter="24"></mat-spinner>
              <span>Carregando versões...</span>
            </div>

            <!-- Error -->
            <div *ngIf="versionsError && !versionsLoading" class="versions-error">
              <mat-icon color="warn">error_outline</mat-icon>
              <span>{{ versionsError.message }}</span>
              <button mat-button color="primary" (click)="retryLoadVersions()" data-testid="process-editor.retryVersions">
                Tentar novamente
              </button>
            </div>

            <!-- Table -->
            <table *ngIf="!versionsLoading && !versionsError && versions.length > 0" mat-table [dataSource]="versions" class="versions-table" data-testid="process-editor.versionsTable">
              <ng-container matColumnDef="version">
                <th mat-header-cell *matHeaderCellDef>Versão</th>
                <td mat-cell *matCellDef="let version">v{{ version.version }}</td>
              </ng-container>

              <ng-container matColumnDef="enabled">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let version">
                  <span class="version-status" [class.enabled]="version.enabled">
                    {{ version.enabled ? 'Habilitada' : 'Desabilitada' }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let version">
                  <button
                    mat-icon-button
                    [routerLink]="['/processes', processId, 'versions', version.version]"
                    aria-label="Editar versão"
                    [attr.data-testid]="'process-editor.editVersion.' + version.version">
                    <mat-icon>edit</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="versionColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: versionColumns;"></tr>
            </table>

            <!-- Empty state -->
            <p *ngIf="!versionsLoading && !versionsError && versions.length === 0" class="no-versions" data-testid="process-editor.noVersions">
              Nenhuma versão criada ainda.
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
    .process-editor {
      max-width: 800px;
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

    .hint-link {
      color: var(--mat-sys-primary);
      text-decoration: none;
    }

    .hint-link:hover {
      text-decoration: underline;
    }

    .destinations-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-bottom: 16px;
    }

    .destination-item {
      padding: 16px;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 8px;
      position: relative;
    }

    .destination-item > button[mat-icon-button] {
      position: absolute;
      top: 8px;
      right: 8px;
    }

    .destination-type {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .destination-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .versions-table {
      width: 100%;
    }

    .version-status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      background: #E8E8E8;
      color: #757575;
    }

    .version-status.enabled {
      background: #D4EDDA;
      color: #155724;
    }

    .no-versions {
      color: var(--mat-sys-on-surface-variant);
      text-align: center;
      padding: 24px;
    }

    .versions-loading {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px;
      color: var(--mat-sys-on-surface-variant);
    }

    .versions-error {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
      border-radius: 8px;
    }
  `]
})
export class ProcessEditorComponent implements OnInit, HasUnsavedChanges {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly processesService = inject(ProcessesService);
  private readonly connectorsService = inject(ConnectorsService);
  private readonly versionsService = inject(VersionsService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly snackbar = inject(SnackbarService);

  form!: FormGroup;
  connectors: ConnectorDto[] = [];
  versions: ProcessVersionDto[] = [];
  versionsLoading = false;
  versionsError: UiError | null = null;
  versionColumns = ['version', 'enabled', 'actions'];

  state: PageState = { kind: 'idle' };
  processId: string | null = null;
  isEditMode = false;
  isDirty = false;

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Processos', route: '/processes' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.processId = this.route.snapshot.paramMap.get('processId');
    this.isEditMode = !!this.processId;

    if (this.isEditMode) {
      this.breadcrumbs.push({ label: 'Editar' });
    } else {
      this.breadcrumbs.push({ label: 'Novo' });
    }

    this.loadData();

    // Track dirty state
    this.form.valueChanges.subscribe(() => {
      this.isDirty = true;
    });
  }

  hasUnsavedChanges(): boolean {
    return this.isDirty;
  }

  loadData(): void {
    this.state = { kind: 'loading' };

    // Load connectors
    this.connectorsService.list().subscribe({
      next: (connectors) => {
        this.connectors = connectors;

        if (this.isEditMode && this.processId) {
          this.loadProcess();
        } else {
          this.state = { kind: 'ready', dirty: false };
        }
      },
      error: (error) => {
        const uiError = this.errorHandler.handleHttpError(error);
        this.state = { kind: 'error', dirty: false, error: uiError };
      }
    });
  }

  private loadProcess(): void {
    if (!this.processId) return;

    this.processesService.get(this.processId).subscribe({
      next: (process) => {
        this.patchForm(process);
        this.loadVersions();
      },
      error: (error) => {
        const uiError = this.errorHandler.handleHttpError(error);
        this.state = { kind: 'error', dirty: false, error: uiError };
      }
    });
  }

  private loadVersions(): void {
    if (!this.processId) return;

    this.versionsLoading = true;
    this.versionsError = null;

    this.versionsService.list(this.processId).subscribe({
      next: (versions) => {
        this.versions = versions.sort((a, b) => a.version - b.version);
        this.versionsLoading = false;
        this.state = { kind: 'ready', dirty: false };
        this.isDirty = false;
      },
      error: (error) => {
        this.versionsLoading = false;
        this.versionsError = this.errorHandler.handleHttpError(error);
        // Continue loading the form even if versions fail
        this.state = { kind: 'ready', dirty: false };
        this.isDirty = false;
      }
    });
  }

  retryLoadVersions(): void {
    this.loadVersions();
  }

  handleHeaderAction(actionId: string): void {
    if (actionId === 'delete') {
      this.confirmDelete();
    }
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

    this.state = { kind: 'saving', dirty: true };
    const formValue = this.form.value;

    const dto: ProcessDto = {
      id: formValue.id,
      name: formValue.name,
      description: formValue.description || null,
      status: formValue.status,
      connectorId: formValue.connectorId,
      tags: null,
      outputDestinations: this.buildOutputDestinations(formValue.outputDestinations)
    };

    const request = this.isEditMode
      ? this.processesService.update(this.processId!, dto)
      : this.processesService.create(dto);

    request.subscribe({
      next: (result) => {
        this.isDirty = false;
        this.snackbar.success(this.isEditMode ? 'Processo atualizado com sucesso.' : 'Processo criado com sucesso.');

        if (!this.isEditMode) {
          this.router.navigate(['/processes', result.id]);
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
    this.router.navigate(['/processes']);
  }

  confirmDelete(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir processo?',
        message: 'Tem certeza que deseja excluir este processo? Esta ação não pode ser desfeita.',
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true && this.processId) {
        this.deleteProcess();
      }
    });
  }

  addDestination(): void {
    this.destinationsArray.push(this.createDestinationGroup());
  }

  removeDestination(index: number): void {
    this.destinationsArray.removeAt(index);
  }

  dismissError(): void {
    this.state = { kind: 'ready', dirty: this.isDirty };
  }

  get destinationsArray(): FormArray {
    return this.form.get('outputDestinations') as FormArray;
  }

  private initForm(): void {
    this.form = this.fb.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      status: ['Draft', Validators.required],
      connectorId: ['', Validators.required],
      outputDestinations: this.fb.array([this.createDestinationGroup()])
    });
  }

  private createDestinationGroup(): FormGroup {
    return this.fb.group({
      type: ['LocalFileSystem'],
      local: this.fb.group({
        basePath: ['']
      }),
      blob: this.fb.group({
        connectionStringRef: [''],
        container: [''],
        pathPrefix: ['']
      })
    });
  }

  private patchForm(process: ProcessDto): void {
    this.form.patchValue({
      id: process.id,
      name: process.name,
      description: process.description,
      status: process.status,
      connectorId: process.connectorId
    });

    // Disable ID field in edit mode
    this.form.get('id')?.disable();

    // Clear and rebuild destinations
    this.destinationsArray.clear();
    for (const dest of process.outputDestinations) {
      const group = this.createDestinationGroup();
      group.patchValue({
        type: dest.type,
        local: dest.type === 'LocalFileSystem' ? dest.local : { basePath: '' },
        blob: dest.type === 'AzureBlobStorage' ? dest.blob : { connectionStringRef: '', container: '', pathPrefix: '' }
      });
      this.destinationsArray.push(group);
    }
  }

  private buildOutputDestinations(formDestinations: any[]): OutputDestination[] {
    return formDestinations.map(dest => {
      if (dest.type === 'LocalFileSystem') {
        return {
          type: 'LocalFileSystem' as const,
          local: { basePath: dest.local.basePath }
        };
      } else {
        return {
          type: 'AzureBlobStorage' as const,
          blob: {
            connectionStringRef: dest.blob.connectionStringRef,
            container: dest.blob.container,
            pathPrefix: dest.blob.pathPrefix || null
          }
        };
      }
    });
  }

  private deleteProcess(): void {
    if (!this.processId) return;

    this.state = { kind: 'deleting', dirty: false };

    this.processesService.delete(this.processId).subscribe({
      next: () => {
        this.isDirty = false;
        this.snackbar.success('Processo excluído com sucesso.');
        this.router.navigate(['/processes']);
      },
      error: (error) => {
        const uiError = this.errorHandler.handleHttpError(error);
        this.errorHandler.showError(uiError);
        this.state = { kind: 'ready', dirty: false };
      }
    });
  }
}
