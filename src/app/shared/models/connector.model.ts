/**
 * Connector Model - MetricsSimple
 * Derivado de: specs/shared/domain/schemas/connector.schema.json
 * Delta 1.2.0: authType, API_KEY, BASIC, requestDefaults
 */

/** Tipos de autenticação suportados */
export type AuthType = 'NONE' | 'BEARER' | 'API_KEY' | 'BASIC';

/** Localização do API Key */
export type ApiKeyLocation = 'HEADER' | 'QUERY';

/** Defaults de request aplicados a todas as chamadas via connector */
export interface RequestDefaults {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: any;
  contentType?: string;
}

export interface ConnectorDto {
  id: string;
  name: string;
  baseUrl: string;
  timeoutSeconds: number;
  enabled?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;

  // Delta 1.2.0: Tipo de autenticação
  authType?: AuthType;

  // BEARER: API Token (write-only)
  apiToken?: string | null;
  apiTokenSpecified?: boolean;
  hasApiToken?: boolean;

  // API_KEY: localização e nome do parâmetro
  apiKeyLocation?: ApiKeyLocation;
  apiKeyName?: string;
  apiKeyValue?: string | null;
  apiKeySpecified?: boolean;
  hasApiKey?: boolean;

  // BASIC: usuário e senha
  basicUsername?: string;
  basicPassword?: string | null;
  basicPasswordSpecified?: boolean;
  hasBasicPassword?: boolean;

  // Defaults de request
  requestDefaults?: RequestDefaults;
}

/**
 * Helper para criar um Connector com valores default
 */
export function createDefaultConnector(): ConnectorDto {
  return {
    id: '',
    name: '',
    baseUrl: '',
    authType: 'NONE',
    timeoutSeconds: 60,
    enabled: true
  };
}
