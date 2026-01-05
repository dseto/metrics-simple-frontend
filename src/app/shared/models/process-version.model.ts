/**
 * ProcessVersion Model - MetricsSimple
 * Derivado de: specs/shared/domain/schemas/processVersion.schema.json
 * Delta 1.2.0: body + contentType no SourceRequest
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type DslProfile = 'jsonata' | 'jmespath' | 'custom';

export interface SourceRequestDto {
  method: HttpMethod;
  path: string;
  headers?: Record<string, string> | null;
  queryParams?: Record<string, string> | null;
  /** Request body (JSON ou string) para métodos POST/PUT */
  body?: any;
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
  outputSchema: any;
  sampleInput?: any;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/**
 * Helper para criar uma ProcessVersion com valores default
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
      profile: 'jsonata',
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
 */
export function createDefaultDsl(): DslDto {
  return {
    profile: 'jsonata',
    text: ''
  };
}
