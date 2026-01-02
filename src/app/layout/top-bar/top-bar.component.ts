import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Observable, map, shareReplay } from 'rxjs';

/**
 * MsTopBar - Barra superior
 * Conforme component-specs.md
 */
@Component({
  selector: 'ms-top-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="top-bar">
      <button
        mat-icon-button
        (click)="onMenuToggle.emit()"
        aria-label="Toggle menu"
        data-testid="top-bar.menu-toggle">
        <mat-icon>menu</mat-icon>
      </button>

      <span class="spacer"></span>

      <!-- User menu -->
      <button
        mat-icon-button
        [matMenuTriggerFor]="userMenu"
        aria-label="User menu"
        data-testid="top-bar.user-menu">
        <mat-icon>account_circle</mat-icon>
      </button>

      <mat-menu #userMenu="matMenu">
        <button mat-menu-item disabled>
          <mat-icon>person</mat-icon>
          <span>Admin</span>
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item disabled>
          <mat-icon>settings</mat-icon>
          <span>Configurações</span>
        </button>
        <button mat-menu-item disabled>
          <mat-icon>logout</mat-icon>
          <span>Sair</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .top-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--mat-sys-surface);
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }

    .spacer {
      flex: 1;
    }
  `]
})
export class TopBarComponent {
  @Output() onMenuToggle = new EventEmitter<void>();

  private readonly breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
}
