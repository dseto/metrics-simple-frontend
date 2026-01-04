import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * Interface para configurações runtime
 */
export interface RuntimeConfig {
  apiBaseUrl: string;
  aiEnabled: boolean;
  production: boolean;
  envName: string;
}

/**
 * RuntimeConfigService - Gerencia configurações carregadas em runtime
 * 
 * Este serviço carrega configurações do arquivo assets/config.json durante
 * o bootstrap da aplicação (antes de qualquer componente ser inicializado).
 * 
 * Permite injetar configurações no momento do deploy sem rebuild:
 * - Docker: substituir config.json no ENTRYPOINT
 * - VM/Server: substituir arquivo antes de startar servidor
 */
@Injectable({
  providedIn: 'root'
})
export class RuntimeConfigService {
  private config: RuntimeConfig | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Carrega configurações do arquivo config.json
   * Este método é chamado automaticamente via APP_INITIALIZER
   */
  async loadConfig(): Promise<void> {
    try {
      // Adiciona cache-buster para evitar cache do browser
      const cacheBuster = new Date().getTime();
      this.config = await firstValueFrom(
        this.http.get<RuntimeConfig>(`/assets/config.json?v=${cacheBuster}`)
      );
      console.log('✅ Runtime configuration loaded:', this.config);
    } catch (error) {
      console.error('❌ Failed to load runtime configuration. Using fallback.', error);
      // Fallback para configuração padrão
      this.config = {
        apiBaseUrl: 'http://localhost:8080/api/v1',
        aiEnabled: true,
        production: false,
        envName: 'local'
      };
    }
  }

  /**
   * Obtém a URL base da API
   */
  get apiBaseUrl(): string {
    return this.config?.apiBaseUrl || 'http://localhost:8080/api/v1';
  }

  /**
   * Verifica se está em modo produção
   */
  get isProduction(): boolean {
    return this.config?.production || false;
  }

  /**
   * Verifica se IA está habilitada
   */
  get isAiEnabled(): boolean {
    return this.config?.aiEnabled ?? true;
  }

  /**
   * Obtém o nome do ambiente
   */
  get environmentName(): string {
    return this.config?.envName || 'unknown';
  }

  /**
   * Retorna todas as configurações
   */
  getAll(): RuntimeConfig | null {
    return this.config;
  }

  /**
   * Verifica se configurações foram carregadas
   */
  isLoaded(): boolean {
    return this.config !== null;
  }
}
