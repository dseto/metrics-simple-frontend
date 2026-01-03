import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthProvider } from '../../core/auth/providers';

/**
 * Mensagens de erro conforme specs/frontend/05-ui/login-and-access-control.md
 * e specs/frontend/03-interfaces/security-error-handling.md
 */
const LOGIN_ERRORS = {
  INVALID_CREDENTIALS: 'Usuário ou senha inválidos.',
  TOO_MANY_ATTEMPTS: 'Muitas tentativas, tente mais tarde.',
  GENERIC_ERROR: 'Erro ao fazer login. Tente novamente.'
} as const;

/**
 * LoginComponent - Tela de login
 * Conforme specs/frontend/05-ui/login-and-access-control.md
 *
 * Campos:
 * - username
 * - password
 *
 * Ações:
 * - submit chama POST /api/auth/token via AuthProvider
 * - sucesso: salvar token, navegar para home
 * - 401: exibir "Usuário ou senha inválidos"
 * - 429: exibir "Muitas tentativas, tente mais tarde"
 *
 * Regras:
 * - não persistir senha
 * - limpar campo senha em falha
 * - não logar senha/token
 */
@Component({
  selector: 'ms-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="logo-container">
            <img src="assets/logo.svg" alt="MetricsSimple" class="logo" onerror="this.style.display='none'">
            <h1>MetricsSimple</h1>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <!-- Error message -->
            @if (errorMessage()) {
              <div class="error-banner" role="alert" data-testid="login.error">
                <mat-icon>error</mat-icon>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <!-- Username -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Usuário</mat-label>
              <input
                matInput
                formControlName="username"
                type="text"
                autocomplete="username"
                data-testid="login.username"
                [attr.aria-invalid]="loginForm.controls.username.invalid && loginForm.controls.username.touched">
              <mat-icon matPrefix>person</mat-icon>
              @if (loginForm.controls.username.hasError('required') && loginForm.controls.username.touched) {
                <mat-error>Usuário é obrigatório</mat-error>
              }
            </mat-form-field>

            <!-- Password -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input
                matInput
                formControlName="password"
                [type]="hidePassword() ? 'password' : 'text'"
                autocomplete="current-password"
                data-testid="login.password"
                [attr.aria-invalid]="loginForm.controls.password.invalid && loginForm.controls.password.touched">
              <mat-icon matPrefix>lock</mat-icon>
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword.set(!hidePassword())"
                [attr.aria-label]="hidePassword() ? 'Mostrar senha' : 'Esconder senha'"
                data-testid="login.toggle-password">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (loginForm.controls.password.hasError('required') && loginForm.controls.password.touched) {
                <mat-error>Senha é obrigatória</mat-error>
              }
            </mat-form-field>

            <!-- Submit -->
            <button
              mat-flat-button
              color="primary"
              type="submit"
              class="submit-button"
              [disabled]="isLoading() || loginForm.invalid"
              data-testid="login.submit">
              @if (isLoading()) {
                <mat-spinner diameter="20" class="spinner"></mat-spinner>
                <span>Entrando...</span>
              } @else {
                <span>Entrar</span>
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: var(--mat-sys-surface-container);
      padding: 16px;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 24px;
    }

    mat-card-header {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
    }

    .logo-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .logo {
      width: 64px;
      height: 64px;
    }

    .logo-container h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--mat-sys-primary);
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
      border-radius: 8px;
      font-size: 14px;
    }

    .error-banner mat-icon {
      color: var(--mat-sys-error);
    }

    .submit-button {
      height: 48px;
      font-size: 16px;
      margin-top: 8px;
    }

    .submit-button .spinner {
      margin-right: 8px;
    }

    .submit-button mat-spinner {
      display: inline-block;
    }

    ::ng-deep .submit-button .mat-mdc-button-persistent-ripple {
      border-radius: 24px;
    }
  `]
})
export class LoginComponent {
  private readonly authProvider = inject(AuthProvider);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Form
  readonly loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  // State signals
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hidePassword = signal(true);

  /**
   * Submit do formulário
   * Conforme specs/frontend/05-ui/login-and-access-control.md
   */
  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading()) {
      return;
    }

    const { username, password } = this.loginForm.getRawValue();

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authProvider.login(username, password).subscribe({
      next: () => {
        // Login bem-sucedido - navegar para home
        this.router.navigate(['/dashboard']);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);

        // Limpar campo senha em falha (conforme spec)
        this.loginForm.controls.password.reset();

        // Tratar erro por status
        switch (error.status) {
          case 401:
            this.errorMessage.set(LOGIN_ERRORS.INVALID_CREDENTIALS);
            break;
          case 429:
            this.errorMessage.set(LOGIN_ERRORS.TOO_MANY_ATTEMPTS);
            break;
          default:
            this.errorMessage.set(LOGIN_ERRORS.GENERIC_ERROR);
        }
      }
    });
  }
}
