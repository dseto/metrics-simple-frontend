import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * ConfigService - Serviço centralizado para acessar configurações do ambiente
 * 
 * Fornece acesso tipado e conveniente às configurações definidas nos arquivos environment.
 * Evita imports diretos de environment em todo o código.
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  /**
   * URL base da API backend
   * @example 'http://localhost:8080/api/v1'
   */
  get apiBaseUrl(): string {
    return environment.apiBaseUrl;
  }

  /**
   * Indica se está rodando em modo produção
   */
  get isProduction(): boolean {
    return environment.production;
  }

  /**
   * Indica se funcionalidades de IA estão habilitadas
   */
  get isAiEnabled(): boolean {
    return environment.aiEnabled;
  }

  /**
   * Nome do ambiente atual (para debug/logs)
   * @example 'local', 'staging', 'production'
   */
  get environmentName(): string {
    return environment.envName || 'unknown';
  }

  /**
   * Retorna todas as configurações do ambiente
   */
  getAll(): typeof environment {
    return environment;
  }

  /**
   * Log de debug com informações do ambiente (somente em dev)
   */
  logEnvironmentInfo(): void {
    if (!this.isProduction) {
      console.group('🔧 Environment Configuration');
      console.log('Environment:', this.environmentName);
      console.log('API Base URL:', this.apiBaseUrl);
      console.log('Production Mode:', this.isProduction);
      console.log('AI Enabled:', this.isAiEnabled);
      console.groupEnd();
    }
  }
}
