/**
 * API Error Models - MetricsSimple
 * Derivado de: specs/shared/domain/schemas/apiError.schema.json
 *              specs/shared/domain/schemas/aiError.schema.json
 */

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ApiErrorDetail[] | null;
  correlationId: string;
  executionId?: string | null;
}

export type AiErrorCode =
  | 'AI_DISABLED'
  | 'AI_PROVIDER_UNAVAILABLE'
  | 'AI_TIMEOUT'
  | 'AI_OUTPUT_INVALID'
  | 'AI_RATE_LIMITED';

export interface AiError extends ApiError {
  code: AiErrorCode;
}

/**
 * UiError - Modelo interno para exibição de erros na UI
 */
export interface UiError {
  title: string;
  message: string;
  code?: string;
  details?: string;
  requestId?: string;
  canRetry?: boolean;
}

/**
 * PageState - Estado comum de páginas
 */
export type PageStateKind = 'idle' | 'loading' | 'ready' | 'saving' | 'deleting' | 'error' | 'navigating';

export interface PageState {
  kind: PageStateKind;
  dirty?: boolean;
  error?: UiError;
}

/**
 * Helper para criar UiError a partir de ApiError
 */
export function apiErrorToUiError(apiError: ApiError, canRetry: boolean = true): UiError {
  return {
    title: getErrorTitle(apiError.code),
    message: apiError.message,
    code: apiError.code,
    details: apiError.details ? JSON.stringify(apiError.details, null, 2) : undefined,
    requestId: apiError.correlationId,
    canRetry
  };
}

/**
 * Helper para criar UiError a partir de erro HTTP
 */
export function httpErrorToUiError(status: number, message: string, correlationId?: string): UiError {
  const errorMap: Record<number, { title: string; canRetry: boolean }> = {
    400: { title: 'Requisição inválida', canRetry: false },
    404: { title: 'Não encontrado', canRetry: false },
    409: { title: 'Conflito', canRetry: false },
    422: { title: 'Erro de validação', canRetry: false },
    500: { title: 'Erro interno', canRetry: true },
    503: { title: 'Serviço indisponível', canRetry: true }
  };

  const errorInfo = errorMap[status] || { title: 'Erro inesperado', canRetry: true };

  return {
    title: errorInfo.title,
    message,
    code: `HTTP_${status}`,
    requestId: correlationId,
    canRetry: errorInfo.canRetry
  };
}

/**
 * Helper para criar UiError de rede
 */
export function networkErrorToUiError(): UiError {
  return {
    title: 'Erro de conexão',
    message: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
    code: 'NETWORK_ERROR',
    canRetry: true
  };
}

function getErrorTitle(code: string): string {
  const titles: Record<string, string> = {
    'VALIDATION_FAILED': 'Erro de validação',
    'NOT_FOUND': 'Não encontrado',
    'CONFLICT': 'Conflito',
    'INTERNAL_ERROR': 'Erro interno',
    'AI_DISABLED': 'IA desabilitada',
    'AI_PROVIDER_UNAVAILABLE': 'Serviço de IA indisponível',
    'AI_TIMEOUT': 'Timeout da IA',
    'AI_OUTPUT_INVALID': 'Saída da IA inválida',
    'AI_RATE_LIMITED': 'Limite de requisições IA'
  };
  return titles[code] || 'Erro';
}
