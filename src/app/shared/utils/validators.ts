/**
 * Validators - MetricsSimple
 * Validações client-side conforme ui-field-catalog.md
 */

/**
 * Valida campo obrigatório
 */
export function validateRequired(value: string | null | undefined): string | null {
  if (!value || value.trim() === '') {
    return 'Campo obrigatório.';
  }
  return null;
}

/**
 * Valida URL (http/https)
 */
export function validateUrl(value: string): string | null {
  if (!value || value.trim() === '') {
    return null; // Não valida se vazio (use validateRequired separadamente)
  }
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return 'URL inválida.';
    }
    return null;
  } catch {
    return 'URL inválida.';
  }
}

/**
 * Valida JSON
 */
export function validateJson(value: string): string | null {
  if (!value || value.trim() === '') {
    return null; // Não valida se vazio
  }
  try {
    JSON.parse(value);
    return null;
  } catch {
    return 'JSON inválido. Verifique a sintaxe.';
  }
}

/**
 * Valida valor mínimo
 */
export function validateMinValue(value: number, min: number): string | null {
  if (value < min) {
    return `O valor deve ser maior ou igual a ${min}.`;
  }
  return null;
}

/**
 * Valida inteiro
 */
export function validateInteger(value: number): string | null {
  if (!Number.isInteger(value)) {
    return 'Informe um número inteiro.';
  }
  return null;
}

/**
 * Valida timeout (>= 1)
 */
export function validateTimeout(value: number): string | null {
  if (!Number.isInteger(value) || value < 1) {
    return 'O timeout deve ser maior ou igual a 1.';
  }
  return null;
}

/**
 * Valida version (>= 1)
 */
export function validateVersion(value: number): string | null {
  if (!Number.isInteger(value) || value < 1) {
    return 'Informe um número inteiro ≥ 1.';
  }
  return null;
}

/**
 * Valida chaves duplicadas em KeyValue editor
 */
export function validateNoDuplicateKeys(items: { key: string; value: string }[]): string | null {
  const keys = items
    .map(item => item.key.trim().toLowerCase())
    .filter(key => key !== '');

  const uniqueKeys = new Set(keys);
  if (keys.length !== uniqueKeys.size) {
    return 'Valor inválido.';
  }
  return null;
}

/**
 * Valida mínimo de itens em array
 */
export function validateMinItems(items: any[], min: number): string | null {
  if (items.length < min) {
    return 'Adicione pelo menos um item.';
  }
  return null;
}

/**
 * Valida pathPrefix do Azure Blob (não iniciar com /, não conter ..)
 */
export function validateBlobPathPrefix(value: string | null | undefined): string | null {
  if (!value || value.trim() === '') {
    return null; // Opcional
  }
  if (value.startsWith('/')) {
    return 'Valor inválido.';
  }
  if (value.includes('..')) {
    return 'Valor inválido.';
  }
  return null;
}

/**
 * Valida comprimento máximo
 */
export function validateMaxLength(value: string, max: number): string | null {
  if (value && value.length > max) {
    return `Máx. ${max} caracteres.`;
  }
  return null;
}

/**
 * Valida comprimento mínimo
 */
export function validateMinLength(value: string, min: number): string | null {
  if (value && value.length < min) {
    return `Mín. ${min} caracteres.`;
  }
  return null;
}
