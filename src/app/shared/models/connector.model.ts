/**
 * Connector Model - MetricsSimple
 * Derivado de: specs/shared/domain/schemas/connector.schema.json
 */

export interface ConnectorDto {
  id: string;
  name: string;
  baseUrl: string;
  authRef: string;
  timeoutSeconds: number;
  enabled?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/**
 * Helper para criar um Connector com valores default
 */
export function createDefaultConnector(): ConnectorDto {
  return {
    id: '',
    name: '',
    baseUrl: '',
    authRef: '',
    timeoutSeconds: 60,
    enabled: true
  };
}
