/**
 * Preview Model - MetricsSimple
 * Derivado de: specs/shared/domain/schemas/previewRequest.schema.json
 *              specs/shared/domain/schemas/previewResult.schema.json
 * 
 * Conforme specs/frontend/11-ui/pages/preview-transform.md:
 * - plan deve ser enviado quando disponível (preferido)
 */

import { DslDto } from './process-version.model';

export interface PreviewTransformRequest {
  sampleInput: unknown;
  dsl: DslDto;
  outputSchema: unknown;
  plan?: unknown | null;  // Enviar quando disponível (preferido)
}

export interface ValidationErrorItem {
  path: string;
  message: string;
  kind?: string | null;
}

export interface PreviewTransformResponse {
  isValid: boolean;
  errors: ValidationErrorItem[];
  output: unknown | null;
  previewCsv?: string | null;
}

/**
 * Prefill para navegação para preview
 * Conforme specs/frontend/11-ui/pages/preview-transform.md:
 * - DslProfile é sempre 'ir'
 * - plan deve ser passado quando disponível
 */
export interface PreviewPrefill {
  dslProfile: 'ir';
  dslText: string;
  outputSchemaText: string;
  sampleInputText: string;
  plan?: unknown | null;
}
