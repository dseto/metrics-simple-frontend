import {
  validateRequired,
  validateUrl,
  validateJson,
  validateMinValue,
  validateInteger,
  validateTimeout,
  validateVersion,
  validateNoDuplicateKeys,
  validateMinItems,
  validateBlobPathPrefix,
  validateMaxLength,
  validateMinLength
} from './validators';

describe('Validators', () => {
  describe('validateRequired', () => {
    it('should return null for valid value', () => {
      expect(validateRequired('test')).toBeNull();
    });

    it('should return error for empty string', () => {
      expect(validateRequired('')).toContain('obrigatório');
    });

    it('should return error for whitespace-only string', () => {
      expect(validateRequired('   ')).toContain('obrigatório');
    });

    it('should return error for null', () => {
      expect(validateRequired(null)).toContain('obrigatório');
    });

    it('should return error for undefined', () => {
      expect(validateRequired(undefined)).toContain('obrigatório');
    });
  });

  describe('validateUrl', () => {
    it('should accept valid HTTPS URL', () => {
      expect(validateUrl('https://api.example.com')).toBeNull();
      expect(validateUrl('https://api.example.com/v1')).toBeNull();
    });

    it('should accept valid HTTP URL', () => {
      expect(validateUrl('http://localhost:3000')).toBeNull();
    });

    it('should reject invalid URL', () => {
      expect(validateUrl('not-a-url')).toContain('inválida');
    });

    it('should reject FTP URL', () => {
      expect(validateUrl('ftp://example.com')).toContain('inválida');
    });

    it('should return null for empty string', () => {
      expect(validateUrl('')).toBeNull();
    });
  });

  describe('validateJson', () => {
    it('should accept valid JSON object', () => {
      expect(validateJson('{"key": "value"}')).toBeNull();
    });

    it('should accept valid JSON array', () => {
      expect(validateJson('[1, 2, 3]')).toBeNull();
    });

    it('should reject invalid JSON', () => {
      expect(validateJson('not json')).toContain('inválido');
    });

    it('should return null for empty string', () => {
      expect(validateJson('')).toBeNull();
    });
  });

  describe('validateMinValue', () => {
    it('should accept value equal to min', () => {
      expect(validateMinValue(5, 5)).toBeNull();
    });

    it('should accept value greater than min', () => {
      expect(validateMinValue(10, 5)).toBeNull();
    });

    it('should reject value less than min', () => {
      expect(validateMinValue(3, 5)).toContain('maior ou igual');
    });
  });

  describe('validateInteger', () => {
    it('should accept integer', () => {
      expect(validateInteger(5)).toBeNull();
      expect(validateInteger(0)).toBeNull();
      expect(validateInteger(-5)).toBeNull();
    });

    it('should reject float', () => {
      expect(validateInteger(5.5)).toContain('inteiro');
    });
  });

  describe('validateTimeout', () => {
    it('should accept valid timeout', () => {
      expect(validateTimeout(1)).toBeNull();
      expect(validateTimeout(60)).toBeNull();
    });

    it('should reject zero', () => {
      expect(validateTimeout(0)).toContain('maior ou igual');
    });

    it('should reject negative', () => {
      expect(validateTimeout(-1)).toContain('maior ou igual');
    });

    it('should reject float', () => {
      expect(validateTimeout(1.5)).toContain('maior ou igual');
    });
  });

  describe('validateVersion', () => {
    it('should accept valid version', () => {
      expect(validateVersion(1)).toBeNull();
      expect(validateVersion(100)).toBeNull();
    });

    it('should reject zero', () => {
      expect(validateVersion(0)).toContain('≥ 1');
    });

    it('should reject negative', () => {
      expect(validateVersion(-1)).toContain('≥ 1');
    });

    it('should reject float', () => {
      expect(validateVersion(1.5)).toContain('inteiro');
    });
  });

  describe('validateNoDuplicateKeys', () => {
    it('should accept unique keys', () => {
      const items = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' }
      ];
      expect(validateNoDuplicateKeys(items)).toBeNull();
    });

    it('should reject duplicate keys', () => {
      const items = [
        { key: 'key1', value: 'value1' },
        { key: 'key1', value: 'value2' }
      ];
      expect(validateNoDuplicateKeys(items)).toContain('inválido');
    });

    it('should be case insensitive', () => {
      const items = [
        { key: 'Key1', value: 'value1' },
        { key: 'key1', value: 'value2' }
      ];
      expect(validateNoDuplicateKeys(items)).toContain('inválido');
    });

    it('should ignore empty keys', () => {
      const items = [
        { key: '', value: 'value1' },
        { key: '', value: 'value2' }
      ];
      expect(validateNoDuplicateKeys(items)).toBeNull();
    });
  });

  describe('validateMinItems', () => {
    it('should accept array with enough items', () => {
      expect(validateMinItems([1, 2, 3], 2)).toBeNull();
    });

    it('should reject array with too few items', () => {
      expect(validateMinItems([1], 2)).toContain('pelo menos');
    });

    it('should accept empty array when min is 0', () => {
      expect(validateMinItems([], 0)).toBeNull();
    });
  });

  describe('validateBlobPathPrefix', () => {
    it('should accept valid path', () => {
      expect(validateBlobPathPrefix('folder/subfolder')).toBeNull();
    });

    it('should reject path starting with /', () => {
      expect(validateBlobPathPrefix('/folder')).toContain('inválido');
    });

    it('should reject path with ..', () => {
      expect(validateBlobPathPrefix('folder/../other')).toContain('inválido');
    });

    it('should return null for empty string', () => {
      expect(validateBlobPathPrefix('')).toBeNull();
    });

    it('should return null for null', () => {
      expect(validateBlobPathPrefix(null)).toBeNull();
    });
  });

  describe('validateMaxLength', () => {
    it('should accept string within limit', () => {
      expect(validateMaxLength('test', 10)).toBeNull();
    });

    it('should reject string exceeding limit', () => {
      expect(validateMaxLength('this is too long', 5)).toContain('Máx.');
    });
  });

  describe('validateMinLength', () => {
    it('should accept string meeting minimum', () => {
      expect(validateMinLength('test', 3)).toBeNull();
    });

    it('should reject string below minimum', () => {
      expect(validateMinLength('ab', 3)).toContain('Mín.');
    });
  });
});
