import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, map, shareReplay } from 'rxjs';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { TopBarComponent } from '../top-bar/top-bar.component';

/**
 * MsAppShell - Layout principal da aplicação
 * Conforme component-specs.md
 * - Drawer + Top bar + Container
 * - Responsivo: drawer overlay em mobile, side em desktop
 */
@Component({
  selector: 'ms-app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    SideNavComponent,
    TopBarComponent
  ],
  template: `
    <mat-sidenav-container class="app-shell">
      <mat-sidenav
        #drawer
        [mode]="(isHandset$ | async) ? 'over' : 'side'"
        [opened]="!(isHandset$ | async)"
        [fixedInViewport]="true"
        class="app-sidenav">
        <ms-side-nav (onNavigate)="drawer.close()"></ms-side-nav>
      </mat-sidenav>

      <mat-sidenav-content class="app-content">
        <ms-top-bar (onMenuToggle)="drawer.toggle()"></ms-top-bar>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .app-shell {
      height: 100vh;
    }

    .app-sidenav {
      width: 280px;
      background: var(--mat-sys-surface);
      border-right: 1px solid var(--mat-sys-outline-variant);
    }

    .app-content {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .main-content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      background: var(--mat-sys-surface-container);
    }

    @media (max-width: 959px) {
      .main-content {
        padding: 16px;
      }
    }
  `]
})
export class AppShellComponent {
  @ViewChild('drawer') drawer!: MatSidenav;

  private readonly breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
}
