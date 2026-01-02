import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { SkeletonListComponent } from '../../../shared/components/skeleton-list/skeleton-list.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ProcessesService } from '../../../core/services/api/processes.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { ProcessDto } from '../../../shared/models/process.model';
import { UiError, PageState } from '../../../shared/models/api-error.model';

/**
 * ProcessesList - Listagem de processos
 * Conforme pages/processes.md
 */
@Component({
  selector: 'ms-processes-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatDividerModule,
    PageHeaderComponent,
    StatusChipComponent,
    SkeletonListComponent,
    EmptyStateComponent,
    ErrorBannerComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="processes-list" data-testid="page.processes">
      <ms-page-header
        title="Processos"
        subtitle="Gerencie seus processos de métricas"
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

      <!-- Search -->
      <div class="search-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Buscar processos</mat-label>
          <input
            matInput
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearch()"
            placeholder="Digite para buscar..."
            data-testid="processes.search">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <!-- Loading -->
      <ms-skeleton-list
        *ngIf="state.kind === 'loading'"
        [rows]="10"
        testId="processes.skeleton">
      </ms-skeleton-list>

      <!-- Empty -->
      <ms-empty-state
        *ngIf="state.kind === 'ready' && filteredProcesses.length === 0 && !searchTerm"
        icon="account_tree"
        title="Nenhum processo criado"
        description="Crie seu primeiro processo para começar a gerar métricas."
        actionLabel="Criar Processo"
        actionIcon="add"
        (onAction)="navigateToCreate()">
      </ms-empty-state>

      <!-- No results -->
      <ms-empty-state
        *ngIf="state.kind === 'ready' && filteredProcesses.length === 0 && searchTerm"
        icon="search_off"
        title="Nenhum resultado encontrado"
        [description]="noResultsDescription">
      </ms-empty-state>

      <!-- Table -->
      <div *ngIf="state.kind === 'ready' && filteredProcesses.length > 0" class="table-container">
        <table
          mat-table
          [dataSource]="paginatedProcesses"
          matSort
          (matSortChange)="onSort($event)"
          class="processes-table">

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Nome do Processo</th>
            <td mat-cell *matCellDef="let process">
              <a [routerLink]="['/processes', process.id]" class="process-link">
                {{ process.name }}
              </a>
              <div *ngIf="process.description" class="process-description">
                {{ process.description }}
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let process">
              <ms-status-chip [status]="process.status"></ms-status-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="updatedAt">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Última Modificação</th>
            <td mat-cell *matCellDef="let process">
              {{ formatDate(process.updatedAt) }}
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let process">
              <button
                mat-icon-button
                [matMenuTriggerFor]="actionsMenu"
                aria-label="Ações"
                [attr.data-testid]="'processes.actions.' + process.id">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #actionsMenu="matMenu">
                <button mat-menu-item [routerLink]="['/processes', process.id]">
                  <mat-icon>edit</mat-icon>
                  <span>Editar</span>
                </button>
                <button mat-menu-item [routerLink]="['/processes', process.id, 'versions', 'new']">
                  <mat-icon>add</mat-icon>
                  <span>Nova Versão</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="confirmDelete(process)" class="delete-action">
                  <mat-icon color="warn">delete</mat-icon>
                  <span>Excluir</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator
          [length]="filteredProcesses.length"
          [pageSize]="pageSize"
          [pageIndex]="pageIndex"
          [pageSizeOptions]="[10, 25, 50]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .processes-list {
      max-width: 1200px;
      margin: 0 auto;
    }

    .search-bar {
      margin-bottom: 16px;
    }

    .search-field {
      width: 100%;
      max-width: 400px;
    }

    .table-container {
      background: var(--mat-sys-surface);
      border-radius: 8px;
      overflow: hidden;
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

    .process-description {
      font-size: 12px;
      color: var(--mat-sys-on-surface-variant);
      margin-top: 4px;
    }

    .delete-action {
      color: var(--mat-sys-error);
    }
  `]
})
export class ProcessesListComponent implements OnInit {
  private readonly processesService = inject(ProcessesService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly snackbar = inject(SnackbarService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  processes: ProcessDto[] = [];
  filteredProcesses: ProcessDto[] = [];
  paginatedProcesses: ProcessDto[] = [];
  displayedColumns = ['name', 'status', 'updatedAt', 'actions'];

  state: PageState = { kind: 'idle' };
  searchTerm = '';
  pageSize = 10;
  pageIndex = 0;
  sortActive = 'updatedAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  get noResultsDescription(): string {
    return `Nenhum processo encontrado para "${this.searchTerm}".`;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.state = { kind: 'loading' };

    this.processesService.list().subscribe({
      next: (processes) => {
        this.processes = processes;
        this.applyFilters();
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

  onSearch(): void {
    this.pageIndex = 0;
    this.applyFilters();
  }

  onSort(sort: Sort): void {
    this.sortActive = sort.active;
    this.sortDirection = sort.direction as 'asc' | 'desc' || 'asc';
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagination();
  }

  confirmDelete(process: ProcessDto): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir processo?',
        message: `Tem certeza que deseja excluir "${process.name}"? Esta ação não pode ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteProcess(process);
      }
    });
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

  private deleteProcess(process: ProcessDto): void {
    this.state = { kind: 'deleting', dirty: false };

    this.processesService.delete(process.id).subscribe({
      next: () => {
        this.snackbar.success(`Processo "${process.name}" excluído com sucesso.`);
        this.loadData();
      },
      error: (error) => {
        const uiError = this.errorHandler.handleHttpError(error);
        this.errorHandler.showError(uiError);
        this.state = { kind: 'ready', dirty: false };
      }
    });
  }

  private applyFilters(): void {
    let result = [...this.processes];

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        (p.description?.toLowerCase().includes(term))
      );
    }

    // Sort
    result.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (this.sortActive) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        case 'updatedAt':
        default:
          valueA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          valueB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          break;
      }

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredProcesses = result;
    this.updatePagination();
  }

  private updatePagination(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedProcesses = this.filteredProcesses.slice(start, end);
  }
}
