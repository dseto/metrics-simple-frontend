/**
 * AI Model - MetricsSimple
 * Derivado de: specs/shared/domain/schemas/dslGenerateRequest.schema.json
 *              specs/shared/domain/schemas/dslGenerateResult.schema.json
 */

import { DslDto } from './process-version.model';

export interface DslGenerateConstraints {
  maxColumns: number;
  allowTransforms: boolean;
  forbidNetworkCalls: boolean;
  forbidCodeExecution: boolean;
}

export interface DslGenerateRequest {
  goalText: string;
  sampleInput: any;
  dslProfile: 'jsonata' | 'jmespath';
  constraints: DslGenerateConstraints;
  hints?: Record<string, string> | null;
  existingDsl?: string | null;
  existingOutputSchema?: any;
}

export interface ModelInfo {
  provider?: string;
  model?: string;
  promptVersion?: string;
}

export interface DslGenerateResult {
  dsl: DslDto;
  outputSchema: any;
  exampleRows?: any[] | null;
  rationale: string;
  warnings: string[];
  modelInfo?: ModelInfo | null;
}

/**
 * Estados do AI Assistant
 */
export type AiAssistantState = 'idle' | 'generating' | 'generated' | 'failed' | 'disabled';

/**
 * Helper para criar constraints default
 */
export function createDefaultConstraints(): DslGenerateConstraints {
  return {
    maxColumns: 50,
    allowTransforms: true,
    forbidNetworkCalls: true,
    forbidCodeExecution: true
  };
}

/**
 * Helper para criar request default
 */
export function createDefaultDslGenerateRequest(): DslGenerateRequest {
  return {
    goalText: '',
    sampleInput: {},
    dslProfile: 'jsonata',
    constraints: createDefaultConstraints(),
    hints: null,
    existingDsl: null,
    existingOutputSchema: null
  };
}
