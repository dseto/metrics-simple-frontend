import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { SkeletonListComponent } from '../../shared/components/skeleton-list/skeleton-list.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';
import { ProcessesService } from '../../core/services/api/processes.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { ProcessDto } from '../../shared/models/process.model';
import { UiError, PageState } from '../../shared/models/api-error.model';

/**
 * Dashboard - Página inicial
 * Conforme pages/dashboard.md
 */
@Component({
  selector: 'ms-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    PageHeaderComponent,
    StatusChipComponent,
    SkeletonListComponent,
    EmptyStateComponent,
    ErrorBannerComponent
  ],
  template: `
    <div class="dashboard" data-testid="page.dashboard">
      <ms-page-header
        title="Dashboard"
        subtitle="Visão geral dos seus processos de métricas"
        [primaryAction]="{ id: 'create', label: 'Novo Processo', icon: 'add', variant: 'filled' }"
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

      <!-- Quick Stats -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">Total de Processos</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value stat-active">{{ stats.active }}</div>
            <div class="stat-label">Ativos</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value stat-draft">{{ stats.draft }}</div>
            <div class="stat-label">Rascunhos</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value stat-disabled">{{ stats.disabled }}</div>
            <div class="stat-label">Desativados</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Recent Processes -->
      <mat-card class="recent-card">
        <mat-card-header>
          <mat-card-title>Processos Recentes</mat-card-title>
          <button mat-button color="primary" routerLink="/processes">
            Ver todos
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </mat-card-header>
        <mat-card-content>
          <!-- Loading -->
          <ms-skeleton-list
            *ngIf="state.kind === 'loading'"
            [rows]="5"
            testId="dashboard.skeleton">
          </ms-skeleton-list>

          <!-- Empty -->
          <ms-empty-state
            *ngIf="state.kind === 'ready' && processes.length === 0"
            icon="account_tree"
            title="Nenhum processo criado"
            description="Crie seu primeiro processo para começar a gerar métricas."
            actionLabel="Criar Processo"
            actionIcon="add"
            (onAction)="navigateToCreate()">
          </ms-empty-state>

          <!-- Table -->
          <table
            *ngIf="state.kind === 'ready' && processes.length > 0"
            mat-table
            [dataSource]="processes"
            class="processes-table">

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nome do Processo</th>
              <td mat-cell *matCellDef="let process">
                <a [routerLink]="['/processes', process.id]" class="process-link">
                  {{ process.name }}
                </a>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let process">
                <ms-status-chip [status]="process.status" size="sm"></ms-status-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="updatedAt">
              <th mat-header-cell *matHeaderCellDef>Última Modificação</th>
              <td mat-cell *matCellDef="let process">
                {{ formatDate(process.updatedAt) }}
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let process">
                <button mat-icon-button [routerLink]="['/processes', process.id]" aria-label="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <mat-card class="action-card" routerLink="/processes/new">
          <mat-card-content>
            <mat-icon>add_circle</mat-icon>
            <span>Novo Processo</span>
          </mat-card-content>
        </mat-card>
        <mat-card class="action-card" routerLink="/connectors">
          <mat-card-content>
            <mat-icon>cable</mat-icon>
            <span>Gerenciar Conectores</span>
          </mat-card-content>
        </mat-card>
        <mat-card class="action-card" routerLink="/preview">
          <mat-card-content>
            <mat-icon>preview</mat-icon>
            <span>Testar Transformação</span>
          </mat-card-content>
        </mat-card>
        <mat-card class="action-card" routerLink="/runner">
          <mat-card-content>
            <mat-icon>terminal</mat-icon>
            <span>Documentação Runner</span>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      text-align: center;
    }

    .stat-value {
      font-size: 36px;
      font-weight: 600;
      color: var(--mat-sys-primary);
    }

    .stat-active {
      color: #00B050;
    }

    .stat-draft {
      color: #FFC107;
    }

    .stat-disabled {
      color: #757575;
    }

    .stat-label {
      font-size: 14px;
      color: var(--mat-sys-on-surface-variant);
      margin-top: 4px;
    }

    .recent-card {
      margin-bottom: 24px;
    }

    .recent-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .processes-table {
      width: 100%;
    }

    .process-link {
      color: var(--mat-sys-primary);
      text-decoration: none;
      font-weight: 500;
    }

    .process-link:hover {
      text-decoration: underline;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .action-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .action-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
    }

    .action-card mat-icon {
      color: var(--mat-sys-primary);
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .action-card span {
      font-weight: 500;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly processesService = inject(ProcessesService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly router = inject(Router);

  processes: ProcessDto[] = [];
  displayedColumns = ['name', 'status', 'updatedAt', 'actions'];

  state: PageState = { kind: 'idle' };

  stats = {
    total: 0,
    active: 0,
    draft: 0,
    disabled: 0
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.state = { kind: 'loading' };

    this.processesService.list().subscribe({
      next: (processes) => {
        this.processes = processes
          .sort((a, b) => {
            const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 5);

        this.calculateStats(processes);
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
      this.navigateToCreate();
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/processes/new']);
  }

  dismissError(): void {
    this.state = { kind: 'ready', dirty: false };
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private calculateStats(processes: ProcessDto[]): void {
    this.stats = {
      total: processes.length,
      active: processes.filter(p => p.status === 'Active').length,
      draft: processes.filter(p => p.status === 'Draft').length,
      disabled: processes.filter(p => p.status === 'Disabled').length
    };
  }
}
