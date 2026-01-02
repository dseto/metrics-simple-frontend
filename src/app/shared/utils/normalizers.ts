/**
 * Normalizers - MetricsSimple
 * Normalização de dados antes de enviar para API
 * Conforme ui-api-client-contract.md
 */

import { ProcessDto, OutputDestination } from '../models/process.model';
import { ProcessVersionDto, SourceRequestDto } from '../models/process-version.model';
import { ConnectorDto } from '../models/connector.model';

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
 */
export function normalizeSourceRequest(req: SourceRequestDto): SourceRequestDto {
  return {
    method: req.method,
    path: normalizeString(req.path),
    headers: normalizeKeyValueMap(req.headers),
    queryParams: normalizeKeyValueMap(req.queryParams)
  };
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
 */
export function normalizeConnector(dto: ConnectorDto): ConnectorDto {
  return {
    ...dto,
    id: normalizeString(dto.id),
    name: normalizeString(dto.name),
    baseUrl: normalizeString(dto.baseUrl),
    authRef: normalizeString(dto.authRef)
  };
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
export function formatJson(data: any): string {
  return JSON.stringify(data, null, 2);
}
