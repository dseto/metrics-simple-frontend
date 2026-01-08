/**
 * AI Model - MetricsSimple
 * Derivado de: specs/shared/domain/schemas/dslGenerateRequest.schema.json
 *              specs/shared/domain/schemas/dslGenerateResult.schema.json
 * 
 * Conforme specs/frontend/11-ui/ui-api-client-contract.md:
 * - dslProfile é sempre 'ir' (IR/PlanV1)
 * - plan é retornado pelo backend e deve ser preservado para preview
 */

import { DslDto } from './process-version.model';

export interface DslGenerateConstraints {
  maxColumns: number;           // default 50
  allowTransforms: boolean;     // default true
  forbidNetworkCalls: boolean;  // default true
  forbidCodeExecution: boolean; // default true
}

export interface DslGenerateHints {
  columns?: string;
}

export interface DslGenerateRequest {
  goalText: string;
  sampleInput: unknown;
  dslProfile: 'ir';  // Fixo 'ir' - conforme specs/frontend/11-ui/ui-ai-assistant.md
  constraints: DslGenerateConstraints;
  hints?: DslGenerateHints | null;
  existingDsl?: DslDto | null;
  existingOutputSchema?: unknown | null;
  engine?: 'plan_v1';  // opcional
}

export interface ModelInfo {
  provider?: string;
  model?: string;
  promptVersion?: string;
}

export interface DslGenerateResult {
  dsl: DslDto;
  outputSchema: unknown;
  exampleRows?: unknown[] | null;
  plan?: unknown | null;  // Plan IR (objeto) - preservar para preview
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
 * Conforme specs/frontend/11-ui/ui-field-catalog.md
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
 * Conforme specs/frontend/11-ui/ui-ai-assistant.md - dslProfile sempre 'ir'
 */
export function createDefaultDslGenerateRequest(): DslGenerateRequest {
  return {
    goalText: '',
    sampleInput: {},
    dslProfile: 'ir',
    constraints: createDefaultConstraints(),
    hints: null,
    existingDsl: null,
    existingOutputSchema: null
  };
}
