import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { ProcessStatus } from '../../models/process.model';

/**
 * MsStatusChip - Chip de status
 * Conforme component-specs.md
 */
@Component({
  selector: 'ms-status-chip',
  standalone: true,
  imports: [CommonModule, MatChipsModule],
  template: `
    <span
      class="status-chip"
      [class.status-draft]="status === 'Draft'"
      [class.status-active]="status === 'Active'"
      [class.status-disabled]="status === 'Disabled'"
      [class.size-sm]="size === 'sm'"
      [attr.data-testid]="'status-chip.' + status.toLowerCase()">
      {{ getLabel() }}
    </span>
  `,
  styles: [`
    .status-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.4;
    }

    .size-sm {
      padding: 2px 8px;
      font-size: 12px;
    }

    .status-draft {
      background-color: #FFF3CD;
      color: #856404;
    }

    .status-active {
      background-color: #D4EDDA;
      color: #155724;
    }

    .status-disabled {
      background-color: #E8E8E8;
      color: #757575;
    }
  `]
})
export class StatusChipComponent {
  @Input() status: ProcessStatus = 'Draft';
  @Input() size: 'sm' | 'md' = 'md';

  getLabel(): string {
    const labels: Record<ProcessStatus, string> = {
      'Draft': 'Rascunho',
      'Active': 'Ativo',
      'Disabled': 'Desativado'
    };
    return labels[this.status];
  }
}
