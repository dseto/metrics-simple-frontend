/**
 * Normalizers - MetricsSimple
 * Normalização de dados antes de enviar para API
 * Conforme ui-api-client-contract.md
 * Delta 1.2.0: authType, secrets *Specified, requestDefaults, body+contentType
 */

import { ProcessDto, OutputDestination } from '../models/process.model';
import { ProcessVersionDto, SourceRequestDto } from '../models/process-version.model';
import { ConnectorDto, RequestDefaults } from '../models/connector.model';

/**
 * Normaliza string (trim)
 */
export function normalizeString(value: string | null | undefined): string {
  return value?.trim() || '';
}

/**
 * Normaliza Process antes de enviar para API
 */
export function normalizeProcess(dto: ProcessDto): ProcessDto {
  return {
    ...dto,
    id: normalizeString(dto.id),
    name: normalizeString(dto.name),
    description: dto.description?.trim() || null,
    connectorId: normalizeString(dto.connectorId),
    tags: dto.tags?.map(t => t.trim()).filter(t => t !== '') || null,
    outputDestinations: dto.outputDestinations.map(normalizeOutputDestination)
  };
}

/**
 * Normaliza OutputDestination
 */
export function normalizeOutputDestination(dest: OutputDestination): OutputDestination {
  if (dest.type === 'LocalFileSystem') {
    return {
      type: 'LocalFileSystem',
      local: {
        basePath: normalizeString(dest.local?.basePath)
      }
    };
  } else {
    return {
      type: 'AzureBlobStorage',
      blob: {
        connectionStringRef: normalizeString(dest.blob?.connectionStringRef),
        container: normalizeString(dest.blob?.container),
        pathPrefix: dest.blob?.pathPrefix?.trim() || null
      }
    };
  }
}

/**
 * Normaliza ProcessVersion antes de enviar para API
 */
export function normalizeProcessVersion(dto: ProcessVersionDto): ProcessVersionDto {
  return {
    ...dto,
    processId: normalizeString(dto.processId),
    sourceRequest: normalizeSourceRequest(dto.sourceRequest),
    dsl: {
      profile: dto.dsl.profile,
      text: dto.dsl.text.trim()
    }
  };
}

/**
 * Normaliza SourceRequest
 * Delta 1.2.0: inclui body e contentType
 */
export function normalizeSourceRequest(req: SourceRequestDto): SourceRequestDto {
  const normalized: SourceRequestDto = {
    method: req.method,
    path: normalizeString(req.path),
    headers: normalizeKeyValueMap(req.headers),
    queryParams: normalizeKeyValueMap(req.queryParams)
  };

  // Body: enviar se definido (null remove, undefined omite)
  if (req.body !== undefined) {
    normalized.body = req.body;
  }

  // ContentType: enviar se definido e não vazio
  if (req.contentType !== undefined) {
    const trimmed = req.contentType?.trim();
    if (trimmed && trimmed.length > 0) {
      normalized.contentType = trimmed;
    }
  }

  return normalized;
}

/**
 * Normaliza KeyValue map (remove chaves vazias, trim)
 */
export function normalizeKeyValueMap(
  map: Record<string, string> | null | undefined
): Record<string, string> | null {
  if (!map) return null;

  const normalized: Record<string, string> = {};
  let hasEntries = false;

  for (const [key, value] of Object.entries(map)) {
    const trimmedKey = key.trim();
    if (trimmedKey !== '') {
      normalized[trimmedKey] = value.trim();
      hasEntries = true;
    }
  }

  return hasEntries ? normalized : null;
}

/**
 * Normaliza Connector antes de enviar para API
 * 
 * Delta 1.2.0: authType, secrets (*Specified), requestDefaults
 * 
 * Semântica de secrets (apiToken, apiKeyValue, basicPassword):
 * - Se *Specified=true e valor=string => substituir
 * - Se *Specified=true e valor=null => remover
 * - Se *Specified ausente/false => manter (não enviar)
 */
export function normalizeConnector(dto: ConnectorDto): ConnectorDto {
  const normalized: ConnectorDto = {
    id: normalizeString(dto.id),
    name: normalizeString(dto.name),
    baseUrl: normalizeString(dto.baseUrl),
    timeoutSeconds: dto.timeoutSeconds,
    enabled: dto.enabled,
    authType: dto.authType || 'NONE'
  };

  // Campos específicos por authType
  if (dto.authType === 'API_KEY') {
    if (dto.apiKeyLocation) normalized.apiKeyLocation = dto.apiKeyLocation;
    if (dto.apiKeyName) normalized.apiKeyName = normalizeString(dto.apiKeyName);
  }

  if (dto.authType === 'BASIC') {
    if (dto.basicUsername !== undefined) normalized.basicUsername = normalizeString(dto.basicUsername);
  }

  // Processa apiToken conforme semântica *Specified
  if (dto.apiTokenSpecified) {
    normalized.apiTokenSpecified = true;
    if (dto.apiToken === null) {
      normalized.apiToken = null;
    } else if (typeof dto.apiToken === 'string') {
      const trimmed = dto.apiToken.trim();
      normalized.apiToken = trimmed.length > 0 ? trimmed : null;
    }
  }

  // Processa apiKeyValue conforme semântica *Specified
  if (dto.apiKeySpecified) {
    normalized.apiKeySpecified = true;
    if (dto.apiKeyValue === null) {
      normalized.apiKeyValue = null;
    } else if (typeof dto.apiKeyValue === 'string') {
      const trimmed = dto.apiKeyValue.trim();
      normalized.apiKeyValue = trimmed.length > 0 ? trimmed : null;
    }
  }

  // Processa basicPassword conforme semântica *Specified
  if (dto.basicPasswordSpecified) {
    normalized.basicPasswordSpecified = true;
    if (dto.basicPassword === null) {
      normalized.basicPassword = null;
    } else if (typeof dto.basicPassword === 'string') {
      const trimmed = dto.basicPassword.trim();
      normalized.basicPassword = trimmed.length > 0 ? trimmed : null;
    }
  }

  // Processa requestDefaults
  if (dto.requestDefaults) {
    normalized.requestDefaults = normalizeRequestDefaults(dto.requestDefaults);
  }

  // Remove campos read-only (nunca enviar)
  delete normalized.hasApiToken;
  delete normalized.hasApiKey;
  delete normalized.hasBasicPassword;
  delete normalized.createdAt;
  delete normalized.updatedAt;

  return normalized;
}

/**
 * Normaliza RequestDefaults
 */
export function normalizeRequestDefaults(defaults: RequestDefaults): RequestDefaults | undefined {
  const normalized: RequestDefaults = {};
  let hasContent = false;

  if (defaults.method) {
    normalized.method = defaults.method;
    hasContent = true;
  }

  const headers = normalizeKeyValueMap(defaults.headers);
  if (headers) {
    normalized.headers = headers;
    hasContent = true;
  }

  const queryParams = normalizeKeyValueMap(defaults.queryParams);
  if (queryParams) {
    normalized.queryParams = queryParams;
    hasContent = true;
  }

  if (defaults.body !== undefined && defaults.body !== null && defaults.body !== '') {
    normalized.body = defaults.body;
    hasContent = true;
  }

  if (defaults.contentType) {
    const trimmed = defaults.contentType.trim();
    if (trimmed.length > 0) {
      normalized.contentType = trimmed;
      hasContent = true;
    }
  }

  return hasContent ? normalized : undefined;
}

/**
 * Converte array de {key, value} para Record
 */
export function keyValueArrayToRecord(
  items: { key: string; value: string }[]
): Record<string, string> | null {
  const record: Record<string, string> = {};
  let hasEntries = false;

  for (const item of items) {
    const key = item.key.trim();
    if (key !== '') {
      record[key] = item.value.trim();
      hasEntries = true;
    }
  }

  return hasEntries ? record : null;
}

/**
 * Converte Record para array de {key, value}
 */
export function recordToKeyValueArray(
  record: Record<string, string> | null | undefined
): { key: string; value: string }[] {
  if (!record) return [];
  return Object.entries(record).map(([key, value]) => ({ key, value }));
}

/**
 * Parse JSON seguro
 */
export function safeJsonParse(text: string): { success: true; data: any } | { success: false; error: string } {
  try {
    const data = JSON.parse(text);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: 'JSON inválido. Verifique a sintaxe.' };
  }
}

/**
 * Stringify JSON com formatação
 */
export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

/**
 * PlanExtractor - Extrai plan de dsl.text quando profile === 'ir'
 * Conforme specs/frontend/09-testing/security-auth-tests.md:
 * - dado dsl.profile === 'ir' e dsl.text JSON válido → retorna plan object
 * - se JSON inválido → retorna null e não lança exception
 * 
 * Conforme specs/frontend/11-ui/ui-ai-assistant.md:
 * - Se abrir versão salva e não houver plan em memória, tentar derivar plan
 *   fazendo JSON.parse(dsl.text) quando dsl.profile === 'ir'
 */
export function tryExtractPlan(dslProfile: string, dslText: string): unknown | null {
  if (dslProfile !== 'ir') {
    return null;
  }

  if (!dslText || dslText.trim() === '') {
    return null;
  }

  try {
    const parsed = JSON.parse(dslText);
    // Verificar se é um objeto (plan deve ser objeto, não array ou primitivo)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
