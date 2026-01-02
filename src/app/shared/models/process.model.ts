/**
 * Process Model - MetricsSimple
 * Derivado de: specs/shared/domain/schemas/process.schema.json
 */

export type ProcessStatus = 'Draft' | 'Active' | 'Disabled';

export type OutputDestinationType = 'LocalFileSystem' | 'AzureBlobStorage';

export interface LocalFileSystemConfig {
  basePath: string;
}

export interface AzureBlobStorageConfig {
  connectionStringRef: string;
  container: string;
  pathPrefix?: string | null;
}

export interface LocalFileSystemDestination {
  type: 'LocalFileSystem';
  local: LocalFileSystemConfig;
  blob?: null;
}

export interface AzureBlobStorageDestination {
  type: 'AzureBlobStorage';
  blob: AzureBlobStorageConfig;
  local?: null;
}

export type OutputDestination = LocalFileSystemDestination | AzureBlobStorageDestination;

export interface ProcessDto {
  id: string;
  name: string;
  description?: string | null;
  status: ProcessStatus;
  connectorId: string;
  tags?: string[] | null;
  outputDestinations: OutputDestination[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

/**
 * Helper para criar um Process com valores default
 */
export function createDefaultProcess(): ProcessDto {
  return {
    id: '',
    name: '',
    description: null,
    status: 'Draft',
    connectorId: '',
    tags: null,
    outputDestinations: [
      {
        type: 'LocalFileSystem',
        local: { basePath: '' }
      }
    ]
  };
}

/**
 * Helper para criar um destino LocalFileSystem
 */
export function createLocalDestination(basePath: string = ''): LocalFileSystemDestination {
  return {
    type: 'LocalFileSystem',
    local: { basePath }
  };
}

/**
 * Helper para criar um destino AzureBlobStorage
 */
export function createBlobDestination(
  connectionStringRef: string = '',
  container: string = '',
  pathPrefix: string | null = null
): AzureBlobStorageDestination {
  return {
    type: 'AzureBlobStorage',
    blob: { connectionStringRef, container, pathPrefix }
  };
}
