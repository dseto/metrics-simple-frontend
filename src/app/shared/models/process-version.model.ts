/**
 * ProcessVersion Model - MetricsSimple
 * Derivado de: specs/shared/domain/schemas/processVersion.schema.json
 * Delta 1.2.0: body + contentType no SourceRequest
 * 
 * Conforme specs/frontend/11-ui/ui-api-client-contract.md:
 * - DslProfile agora é sempre 'ir' (IR/PlanV1)
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * DslProfile - Perfil de DSL
 * Conforme specs/frontend/11-ui/ui-ai-assistant.md: apenas 'ir' é suportado
 */
export type DslProfile = 'ir';

export interface SourceRequestDto {
  method: HttpMethod;
  path: string;
  headers?: Record<string, string> | null;
  queryParams?: Record<string, string> | null;
  /** Request body (JSON ou string) para métodos POST/PUT */
  body?: unknown;
  /** Content-Type override (ex.: application/json) */
  contentType?: string;
}

export interface DslDto {
  profile: DslProfile;
  text: string;
}

export interface ProcessVersionDto {
  processId: string;
  version: number;
  enabled: boolean;
  sourceRequest: SourceRequestDto;
  dsl: DslDto;
  outputSchema: unknown;
  sampleInput?: unknown;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/**
 * Helper para criar uma ProcessVersion com valores default
 * Conforme specs/frontend/11-ui/ui-ai-assistant.md: dsl.profile = 'ir'
 */
export function createDefaultProcessVersion(processId: string): ProcessVersionDto {
  return {
    processId,
    version: 1,
    enabled: true,
    sourceRequest: {
      method: 'GET',
      path: '',
      headers: null,
      queryParams: null
    },
    dsl: {
      profile: 'ir',
      text: ''
    },
    outputSchema: {},
    sampleInput: null
  };
}

/**
 * Helper para criar um SourceRequest default
 */
export function createDefaultSourceRequest(): SourceRequestDto {
  return {
    method: 'GET',
    path: '',
    headers: null,
    queryParams: null
  };
}

/**
 * Helper para criar um DSL default
 * Conforme specs/frontend/11-ui/ui-ai-assistant.md: profile = 'ir'
 */
export function createDefaultDsl(): DslDto {
  return {
    profile: 'ir',
    text: ''
  };
}
