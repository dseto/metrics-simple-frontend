import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SkeletonListComponent } from '../../../shared/components/skeleton-list/skeleton-list.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConnectorDialogComponent } from '../connector-dialog/connector-dialog.component';
import { ConnectorsService } from '../../../core/services/api/connectors.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { ConnectorDto } from '../../../shared/models/connector.model';
import { UiError, PageState } from '../../../shared/models/api-error.model';

/**
 * ConnectorsList - Listagem de conectores
 * Conforme pages/connectors.md
 */
@Component({
  selector: 'ms-connectors-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    PageHeaderComponent,
    SkeletonListComponent,
    EmptyStateComponent,
    ErrorBannerComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="connectors-list" data-testid="page.connectors">
      <ms-page-header
        title="Conectores"
        subtitle="Gerencie as conexões com fontes de dados"
        [primaryAction]="{ id: 'create', label: 'Novo Conector', icon: 'add', variant: 'filled' }"
        (onAction)="handleAction($event)">
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
      <ms-skeleton-list
        *ngIf="state.kind === 'loading'"
        [rows]="5"
        testId="connectors.skeleton">
      </ms-skeleton-list>

      <!-- Empty -->
      <ms-empty-state
        *ngIf="state.kind === 'ready' && connectors.length === 0"
        icon="cable"
        title="Nenhum conector criado"
        description="Crie seu primeiro conector para conectar a fontes de dados."
        actionLabel="Criar Conector"
        actionIcon="add"
        (onAction)="openCreateDialog()">
      </ms-empty-state>

      <!-- Table -->
      <div *ngIf="state.kind === 'ready' && connectors.length > 0" class="table-container">
        <table mat-table [dataSource]="connectors" class="connectors-table">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Nome</th>
            <td mat-cell *matCellDef="let connector">
              <strong>{{ connector.name }}</strong>
              <div class="connector-id">{{ connector.id }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="baseUrl">
            <th mat-header-cell *matHeaderCellDef>Base URL</th>
            <td mat-cell *matCellDef="let connector">
              <code class="url-code">{{ connector.baseUrl }}</code>
            </td>
          </ng-container>

          <ng-container matColumnDef="authType">
            <th mat-header-cell *matHeaderCellDef>Auth Type</th>
            <td mat-cell *matCellDef="let connector">
              <span class="auth-type-badge" [attr.data-auth-type]="connector.authType || 'NONE'">
                {{ connector.authType || 'NONE' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="timeout">
            <th mat-header-cell *matHeaderCellDef>Timeout</th>
            <td mat-cell *matCellDef="let connector">
              {{ connector.timeoutSeconds }}s
            </td>
          </ng-container>

          <ng-container matColumnDef="secrets">
            <th mat-header-cell *matHeaderCellDef>Secrets</th>
            <td mat-cell *matCellDef="let connector">
              <div class="secrets-indicators">
                <span *ngIf="connector.hasApiToken" class="secret-indicator configured" matTooltip="Token configurado">
                  <mat-icon class="secret-icon">vpn_key</mat-icon>
                </span>
                <span *ngIf="connector.hasApiKey" class="secret-indicator configured" matTooltip="API Key configurada">
                  <mat-icon class="secret-icon">key</mat-icon>
                </span>
                <span *ngIf="connector.hasBasicPassword" class="secret-indicator configured" matTooltip="Senha configurada">
                  <mat-icon class="secret-icon">password</mat-icon>
                </span>
                <span *ngIf="!connector.hasApiToken && !connector.hasApiKey && !connector.hasBasicPassword" class="secret-indicator none">
                  —
                </span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let connector">
              <span class="status-badge" [class.enabled]="connector.enabled !== false">
                {{ connector.enabled !== false ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let connector">
              <button
                mat-icon-button
                [matMenuTriggerFor]="actionsMenu"
                aria-label="Ações"
                [attr.data-testid]="'connectors.actions.' + connector.id">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #actionsMenu="matMenu">
                <button mat-menu-item (click)="openEditDialog(connector)">
                  <mat-icon>edit</mat-icon>
                  <span>Editar</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="confirmDelete(connector)" class="delete-action">
                  <mat-icon color="warn">delete</mat-icon>
                  <span>Excluir</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .connectors-list {
      max-width: 1200px;
      margin: 0 auto;
    }

    .table-container {
      background: var(--mat-sys-surface);
      border-radius: 8px;
      overflow: hidden;
    }

    .connectors-table {
      width: 100%;
    }

    .connector-id {
      font-size: 12px;
      color: var(--mat-sys-on-surface-variant);
    }

    .url-code {
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 13px;
      background: #F5F5F5;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      background: #E8E8E8;
      color: #757575;
    }

    .status-badge.enabled {
      background: #D4EDDA;
      color: #155724;
    }

    .auth-type-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      background: #E3F2FD;
      color: #1565C0;
    }

    .auth-type-badge[data-auth-type="NONE"] {
      background: #F5F5F5;
      color: #757575;
    }

    .secrets-indicators {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .secret-indicator {
      display: flex;
      align-items: center;
    }

    .secret-indicator.configured {
      color: var(--mat-sys-primary);
    }

    .secret-indicator.none {
      color: var(--mat-sys-on-surface-variant);
    }

    .secret-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .delete-action {
      color: var(--mat-sys-error);
    }
  `]
})
export class ConnectorsListComponent implements OnInit {
  private readonly connectorsService = inject(ConnectorsService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly snackbar = inject(SnackbarService);
  private readonly dialog = inject(MatDialog);

  connectors: ConnectorDto[] = [];
  displayedColumns = ['name', 'baseUrl', 'authType', 'timeout', 'secrets', 'status', 'actions'];
  state: PageState = { kind: 'idle' };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.state = { kind: 'loading' };

    this.connectorsService.list().subscribe({
      next: (connectors) => {
        this.connectors = connectors;
        this.state = { kind: 'ready', dirty: false };
      },
      error: (error) => {
        const uiError = this.errorHandler.handleHttpError(error);
        this.state = { kind: 'error', dirty: false, error: uiError };
      }
    });
  }

  handleAction(actionId: string): void {
    if (actionId === 'create') {
      this.openCreateDialog();
    }
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ConnectorDialogComponent, {
      width: '500px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  openEditDialog(connector: ConnectorDto): void {
    const dialogRef = this.dialog.open(ConnectorDialogComponent, {
      width: '500px',
      data: { mode: 'edit', connector }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  confirmDelete(connector: ConnectorDto): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir conector?',
        message: `Tem certeza que deseja excluir "${connector.name}"? Esta ação não pode ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteConnector(connector);
      }
    });
  }

  dismissError(): void {
    this.state = { kind: 'ready', dirty: false };
  }

  private deleteConnector(connector: ConnectorDto): void {
    this.connectorsService.delete(connector.id).subscribe({
      next: () => {
        this.snackbar.success(`Conector "${connector.name}" excluído com sucesso.`);
        this.loadData();
      },
      error: (error) => {
        // Handle 409 Conflict (connector in use)
        if (error.status === 409) {
          this.snackbar.error('Conector em uso por processos; remova referências antes.');
        } else {
          const uiError = this.errorHandler.handleHttpError(error);
          this.errorHandler.showError(uiError);
        }
      }
    });
  }
}
