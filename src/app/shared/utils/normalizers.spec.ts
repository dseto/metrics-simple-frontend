import {
  normalizeString,
  normalizeProcess,
  normalizeConnector,
  normalizeKeyValueMap,
  recordToKeyValueArray,
  keyValueArrayToRecord,
  safeJsonParse,
  formatJson,
  tryExtractPlan
} from './normalizers';
import { ProcessDto, ProcessStatus } from '../models/process.model';
import { ConnectorDto } from '../models/connector.model';

describe('Normalizers', () => {
  describe('normalizeString', () => {
    it('should trim whitespace', () => {
      expect(normalizeString('  test  ')).toBe('test');
    });

    it('should handle empty string', () => {
      expect(normalizeString('')).toBe('');
    });

    it('should handle null', () => {
      expect(normalizeString(null)).toBe('');
    });

    it('should handle undefined', () => {
      expect(normalizeString(undefined)).toBe('');
    });
  });

  describe('normalizeProcess', () => {
    it('should normalize process fields', () => {
      const process: ProcessDto = {
        id: '  my-process  ',
        name: '  My Process  ',
        description: '  Description  ',
        status: 'Draft' as ProcessStatus,
        connectorId: '  connector  ',
        tags: ['  tag1  ', '  tag2  ', ''],
        outputDestinations: [
          { type: 'LocalFileSystem', local: { basePath: '  /output  ' } }
        ]
      };

      const result = normalizeProcess(process);

      expect(result.id).toBe('my-process');
      expect(result.name).toBe('My Process');
      expect(result.description).toBe('Description');
      expect(result.connectorId).toBe('connector');
      expect(result.tags).toEqual(['tag1', 'tag2']);
    });

    it('should handle null tags', () => {
      const process: ProcessDto = {
        id: 'test',
        name: 'Test',
        description: null,
        status: 'Draft' as ProcessStatus,
        connectorId: 'conn',
        tags: null,
        outputDestinations: [
          { type: 'LocalFileSystem', local: { basePath: '/output' } }
        ]
      };

      const result = normalizeProcess(process);
      expect(result.tags).toBeNull();
    });
  });

  describe('normalizeConnector', () => {
    it('should normalize connector fields', () => {
      const connector: ConnectorDto = {
        id: '  my-connector  ',
        name: '  My Connector  ',
        baseUrl: '  https://api.example.com  ',
        authType: 'BEARER',
        timeoutSeconds: 60
      };

      const result = normalizeConnector(connector);

      expect(result.id).toBe('my-connector');
      expect(result.name).toBe('My Connector');
      expect(result.baseUrl).toBe('https://api.example.com');
      expect(result.authType).toBe('BEARER');
    });

    it('should remove hasApiToken (read-only)', () => {
      const connector: ConnectorDto = {
        id: 'test',
        name: 'Test',
        baseUrl: 'https://api.example.com',
        authType: 'BEARER',
        timeoutSeconds: 60,
        hasApiToken: true
      };

      const result = normalizeConnector(connector);
      expect(result.hasApiToken).toBeUndefined();
    });

    it('should handle apiToken with apiTokenSpecified=true', () => {
      const connector: ConnectorDto = {
        id: 'test',
        name: 'Test',
        baseUrl: 'https://api.example.com',
        authType: 'BEARER',
        timeoutSeconds: 60,
        apiToken: '  secret-token-123  ',
        apiTokenSpecified: true
      };

      const result = normalizeConnector(connector);
      expect(result.apiToken).toBe('secret-token-123');
      expect(result.apiTokenSpecified).toBe(true);
    });

    it('should handle apiToken as null with apiTokenSpecified (explicit removal)', () => {
      const connector: ConnectorDto = {
        id: 'test',
        name: 'Test',
        baseUrl: 'https://api.example.com',
        authType: 'BEARER',
        timeoutSeconds: 60,
        apiToken: null,
        apiTokenSpecified: true
      };

      const result = normalizeConnector(connector);
      expect(result.apiToken).toBeNull();
      expect(result.apiTokenSpecified).toBe(true);
    });

    it('should not include apiToken when apiTokenSpecified is not set', () => {
      const connector: ConnectorDto = {
        id: 'test',
        name: 'Test',
        baseUrl: 'https://api.example.com',
        authType: 'BEARER',
        timeoutSeconds: 60,
        apiToken: '   '
      };

      const result = normalizeConnector(connector);
      expect('apiToken' in result).toBe(false);
    });

    it('should omit apiToken when apiTokenSpecified is absent', () => {
      const connector: ConnectorDto = {
        id: 'test',
        name: 'Test',
        baseUrl: 'https://api.example.com',
        authType: 'BEARER',
        timeoutSeconds: 60
      };

      const result = normalizeConnector(connector);
      expect('apiToken' in result).toBe(false);
    });
  });

  describe('normalizeKeyValueMap', () => {
    it('should trim keys and values', () => {
      const map = { '  key1  ': '  value1  ', '  key2  ': '  value2  ' };
      const result = normalizeKeyValueMap(map);

      expect(result).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('should remove empty keys', () => {
      const map = { '': 'value1', 'key2': 'value2' };
      const result = normalizeKeyValueMap(map);

      expect(result).toEqual({ key2: 'value2' });
    });

    it('should return null for empty map', () => {
      const result = normalizeKeyValueMap({});
      expect(result).toBeNull();
    });

    it('should return null for null input', () => {
      expect(normalizeKeyValueMap(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(normalizeKeyValueMap(undefined)).toBeNull();
    });
  });

  describe('recordToKeyValueArray', () => {
    it('should convert record to array', () => {
      const record = { key1: 'value1', key2: 'value2' };
      const result = recordToKeyValueArray(record);

      expect(result.length).toBe(2);
      expect(result.find(item => item.key === 'key1' && item.value === 'value1')).toBeTruthy();
      expect(result.find(item => item.key === 'key2' && item.value === 'value2')).toBeTruthy();
    });

    it('should handle empty record', () => {
      const result = recordToKeyValueArray({});
      expect(result).toEqual([]);
    });

    it('should handle null', () => {
      expect(recordToKeyValueArray(null)).toEqual([]);
    });

    it('should handle undefined', () => {
      expect(recordToKeyValueArray(undefined)).toEqual([]);
    });
  });

  describe('keyValueArrayToRecord', () => {
    it('should convert array to record', () => {
      const array = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' }
      ];
      const result = keyValueArrayToRecord(array);

      expect(result).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('should handle empty array', () => {
      const result = keyValueArrayToRecord([]);
      expect(result).toBeNull();
    });

    it('should skip items with empty keys', () => {
      const array = [
        { key: '', value: 'value1' },
        { key: 'key2', value: 'value2' }
      ];
      const result = keyValueArrayToRecord(array);

      expect(result).toEqual({ key2: 'value2' });
    });

    it('should trim keys and values', () => {
      const array = [
        { key: '  key1  ', value: '  value1  ' }
      ];
      const result = keyValueArrayToRecord(array);

      expect(result).toEqual({ key1: 'value1' });
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJsonParse('{"key": "value"}');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ key: 'value' });
      }
    });

    it('should handle invalid JSON', () => {
      const result = safeJsonParse('not json');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeTruthy();
      }
    });

    it('should parse arrays', () => {
      const result = safeJsonParse('[1, 2, 3]');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([1, 2, 3]);
      }
    });

    it('should parse nested objects', () => {
      const result = safeJsonParse('{"nested": {"key": "value"}}');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nested.key).toBe('value');
      }
    });
  });

  describe('formatJson', () => {
    it('should format object with indentation', () => {
      const obj = { key: 'value' };
      const result = formatJson(obj);
      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });

    it('should handle arrays', () => {
      const arr = [1, 2, 3];
      const result = formatJson(arr);
      expect(result).toContain('[');
      expect(result).toContain(']');
    });

    it('should handle null', () => {
      const result = formatJson(null);
      expect(result).toBe('null');
    });
  });

  /**
   * Testes de tryExtractPlan
   * Conforme specs/frontend/09-testing/security-auth-tests.md
   */
  describe('tryExtractPlan', () => {
    it('dado dsl.profile === "ir" e dsl.text JSON válido → retorna plan object', () => {
      const planJson = JSON.stringify({ version: 1, columns: [{ name: 'id' }] });
      const result = tryExtractPlan('ir', planJson);

      expect(result).not.toBeNull();
      expect((result as any).version).toBe(1);
      expect((result as any).columns).toBeDefined();
    });

    it('se JSON inválido → retorna null e não lança exception', () => {
      const invalidJson = 'not valid json {';
      
      // Não deve lançar exception
      expect(() => tryExtractPlan('ir', invalidJson)).not.toThrow();
      
      const result = tryExtractPlan('ir', invalidJson);
      expect(result).toBeNull();
    });

    it('se profile não é "ir" → retorna null', () => {
      const validJson = JSON.stringify({ version: 1 });
      
      expect(tryExtractPlan('jsonata', validJson)).toBeNull();
      expect(tryExtractPlan('jmespath', validJson)).toBeNull();
      expect(tryExtractPlan('custom', validJson)).toBeNull();
    });

    it('se dsl.text está vazio → retorna null', () => {
      expect(tryExtractPlan('ir', '')).toBeNull();
      expect(tryExtractPlan('ir', '   ')).toBeNull();
    });

    it('se JSON é array → retorna null (plan deve ser objeto)', () => {
      const arrayJson = JSON.stringify([1, 2, 3]);
      const result = tryExtractPlan('ir', arrayJson);
      
      expect(result).toBeNull();
    });

    it('se JSON é primitivo → retorna null', () => {
      expect(tryExtractPlan('ir', '"string"')).toBeNull();
      expect(tryExtractPlan('ir', '123')).toBeNull();
      expect(tryExtractPlan('ir', 'true')).toBeNull();
      expect(tryExtractPlan('ir', 'null')).toBeNull();
    });
  });
});
