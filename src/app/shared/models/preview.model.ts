/**
 * Preview Model - MetricsSimple
 * Derivado de: specs/shared/domain/schemas/previewRequest.schema.json
 *              specs/shared/domain/schemas/previewResult.schema.json
 */

import { DslDto } from './process-version.model';

export interface PreviewTransformRequest {
  dsl: DslDto;
  outputSchema: any;
  sampleInput: any;
}

export interface ValidationErrorItem {
  path: string;
  message: string;
  kind?: string | null;
}

export interface PreviewTransformResponse {
  isValid: boolean;
  errors: ValidationErrorItem[];
  output: any | null;
  previewCsv?: string | null;
}

/**
 * Prefill para navegação para preview
 */
export interface PreviewPrefill {
  dslProfile: 'jsonata' | 'jmespath' | 'custom';
  dslText: string;
  outputSchemaText: string;
  sampleInputText: string;
}
