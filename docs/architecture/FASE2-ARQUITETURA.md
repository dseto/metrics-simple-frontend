# FASE 2 — Arquitetura Frontend

**Data:** 2026-01-02  
**Projeto:** MetricsSimple Frontend v1.0  
**Stack:** Angular 17+ | Material Design 3 | TypeScript

---

## 1. Estrutura de Pastas

```
metrics-simple/
├── .vscode/
│   ├── extensions.json
│   ├── launch.json
│   └── settings.json
├── src/
│   ├── app/
│   │   ├── core/                          # Singleton services, guards, interceptors
│   │   │   ├── services/
│   │   │   │   ├── api/
│   │   │   │   │   ├── processes.service.ts
│   │   │   │   │   ├── connectors.service.ts
│   │   │   │   │   ├── versions.service.ts
│   │   │   │   │   ├── preview.service.ts
│   │   │   │   │   └── ai.service.ts
│   │   │   │   ├── snackbar.service.ts
│   │   │   │   └── error-handler.service.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── correlation-id.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   ├── guards/
│   │   │   │   └── unsaved-changes.guard.ts
│   │   │   └── core.module.ts
│   │   │
│   │   ├── shared/                        # Shared components, directives, pipes
│   │   │   ├── components/
│   │   │   │   ├── page-header/
│   │   │   │   ├── status-chip/
│   │   │   │   ├── error-banner/
│   │   │   │   ├── confirm-dialog/
│   │   │   │   ├── empty-state/
│   │   │   │   ├── skeleton-list/
│   │   │   │   ├── skeleton-form/
│   │   │   │   ├── json-editor-lite/
│   │   │   │   ├── key-value-editor/
│   │   │   │   └── form-footer/
│   │   │   ├── models/
│   │   │   │   ├── process.model.ts
│   │   │   │   ├── process-version.model.ts
│   │   │   │   ├── connector.model.ts
│   │   │   │   ├── preview.model.ts
│   │   │   │   ├── ai.model.ts
│   │   │   │   ├── api-error.model.ts
│   │   │   │   └── ui-error.model.ts
│   │   │   ├── utils/
│   │   │   │   ├── validators.ts
│   │   │   │   └── normalizers.ts
│   │   │   └── shared.module.ts
│   │   │
│   │   ├── features/                      # Feature modules (lazy loaded)
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   ├── dashboard.component.html
│   │   │   │   ├── dashboard.component.scss
│   │   │   │   └── dashboard.routes.ts
│   │   │   │
│   │   │   ├── processes/
│   │   │   │   ├── processes-list/
│   │   │   │   │   ├── processes-list.component.ts
│   │   │   │   │   ├── processes-list.component.html
│   │   │   │   │   └── processes-list.component.scss
│   │   │   │   ├── process-editor/
│   │   │   │   │   ├── process-editor.component.ts
│   │   │   │   │   ├── process-editor.component.html
│   │   │   │   │   ├── process-editor.component.scss
│   │   │   │   │   └── components/
│   │   │   │   │       ├── process-form/
│   │   │   │   │       ├── destinations-panel/
│   │   │   │   │       └── versions-panel/
│   │   │   │   ├── version-editor/
│   │   │   │   │   ├── version-editor.component.ts
│   │   │   │   │   ├── version-editor.component.html
│   │   │   │   │   ├── version-editor.component.scss
│   │   │   │   │   └── components/
│   │   │   │   │       ├── source-request-form/
│   │   │   │   │       ├── dsl-editor/
│   │   │   │   │       ├── preview-panel/
│   │   │   │   │       └── ai-assistant-panel/
│   │   │   │   └── processes.routes.ts
│   │   │   │
│   │   │   ├── connectors/
│   │   │   │   ├── connectors-list/
│   │   │   │   │   ├── connectors-list.component.ts
│   │   │   │   │   ├── connectors-list.component.html
│   │   │   │   │   └── connectors-list.component.scss
│   │   │   │   ├── connector-dialog/
│   │   │   │   │   ├── connector-dialog.component.ts
│   │   │   │   │   ├── connector-dialog.component.html
│   │   │   │   │   └── connector-dialog.component.scss
│   │   │   │   └── connectors.routes.ts
│   │   │   │
│   │   │   ├── preview/
│   │   │   │   ├── preview-workbench/
│   │   │   │   │   ├── preview-workbench.component.ts
│   │   │   │   │   ├── preview-workbench.component.html
│   │   │   │   │   └── preview-workbench.component.scss
│   │   │   │   └── preview.routes.ts
│   │   │   │
│   │   │   └── runner/
│   │   │       ├── runner-help/
│   │   │       │   ├── runner-help.component.ts
│   │   │       │   ├── runner-help.component.html
│   │   │       │   └── runner-help.component.scss
│   │   │       └── runner.routes.ts
│   │   │
│   │   ├── layout/                        # App shell components
│   │   │   ├── app-shell/
│   │   │   │   ├── app-shell.component.ts
│   │   │   │   ├── app-shell.component.html
│   │   │   │   └── app-shell.component.scss
│   │   │   ├── side-nav/
│   │   │   │   ├── side-nav.component.ts
│   │   │   │   ├── side-nav.component.html
│   │   │   │   └── side-nav.component.scss
│   │   │   └── top-bar/
│   │   │       ├── top-bar.component.ts
│   │   │       ├── top-bar.component.html
│   │   │       └── top-bar.component.scss
│   │   │
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   │
│   ├── assets/
│   │   └── icons/
│   │
│   ├── styles/
│   │   ├── _variables.scss
│   │   ├── _theme.scss
│   │   ├── _typography.scss
│   │   └── styles.scss
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   ├── index.html
│   └── main.ts
│
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
└── README.md
```

---

## 2. Rotas Angular

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  
  {
    path: 'processes',
    loadChildren: () => import('./features/processes/processes.routes')
      .then(m => m.PROCESSES_ROUTES)
  },
  
  {
    path: 'connectors',
    loadChildren: () => import('./features/connectors/connectors.routes')
      .then(m => m.CONNECTORS_ROUTES)
  },
  
  {
    path: 'preview',
    loadComponent: () => import('./features/preview/preview-workbench/preview-workbench.component')
      .then(m => m.PreviewWorkbenchComponent)
  },
  
  {
    path: 'runner',
    loadComponent: () => import('./features/runner/runner-help/runner-help.component')
      .then(m => m.RunnerHelpComponent)
  },
  
  { path: '**', redirectTo: '/dashboard' }
];

// features/processes/processes.routes.ts
export const PROCESSES_ROUTES: Routes = [
  {
    path: '',
    component: ProcessesListComponent
  },
  {
    path: 'new',
    component: ProcessEditorComponent,
    canDeactivate: [UnsavedChangesGuard]
  },
  {
    path: ':processId',
    component: ProcessEditorComponent,
    canDeactivate: [UnsavedChangesGuard]
  },
  {
    path: ':processId/versions/new',
    component: VersionEditorComponent,
    canDeactivate: [UnsavedChangesGuard]
  },
  {
    path: ':processId/versions/:version',
    component: VersionEditorComponent,
    canDeactivate: [UnsavedChangesGuard]
  }
];

// features/connectors/connectors.routes.ts
export const CONNECTORS_ROUTES: Routes = [
  {
    path: '',
    component: ConnectorsListComponent
  }
];
```

---

## 3. Serviços de API

### 3.1 ProcessesService

```typescript
@Injectable({ providedIn: 'root' })
export class ProcessesService {
  private readonly baseUrl = '/api/processes';

  constructor(private http: HttpClient) {}

  list(): Observable<ProcessDto[]>;
  get(id: string): Observable<ProcessDto>;
  create(dto: ProcessDto): Observable<ProcessDto>;
  update(id: string, dto: ProcessDto): Observable<ProcessDto>;
  delete(id: string): Observable<void>;
}
```

### 3.2 VersionsService

```typescript
@Injectable({ providedIn: 'root' })
export class VersionsService {
  constructor(private http: HttpClient) {}

  list(processId: string): Observable<ProcessVersionDto[]>;
  get(processId: string, version: number): Observable<ProcessVersionDto>;
  create(processId: string, dto: ProcessVersionDto): Observable<ProcessVersionDto>;
  update(processId: string, version: number, dto: ProcessVersionDto): Observable<ProcessVersionDto>;
  delete(processId: string, version: number): Observable<void>;
}
```

### 3.3 ConnectorsService

```typescript
@Injectable({ providedIn: 'root' })
export class ConnectorsService {
  private readonly baseUrl = '/api/connectors';

  constructor(private http: HttpClient) {}

  list(): Observable<ConnectorDto[]>;
  get(id: string): Observable<ConnectorDto>;
  create(dto: ConnectorDto): Observable<ConnectorDto>;
  update(id: string, dto: ConnectorDto): Observable<ConnectorDto>;
  delete(id: string): Observable<void>;
}
```

### 3.4 PreviewService

```typescript
@Injectable({ providedIn: 'root' })
export class PreviewService {
  private readonly baseUrl = '/api/preview';

  constructor(private http: HttpClient) {}

  transform(request: PreviewTransformRequest): Observable<PreviewTransformResponse>;
}
```

### 3.5 AiService

```typescript
@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly baseUrl = '/api/ai';

  constructor(private http: HttpClient) {}

  generateDsl(request: DslGenerateRequest): Observable<DslGenerateResult>;
}
```

---

## 4. Modelos TypeScript

### 4.1 process.model.ts

```typescript
export type ProcessStatus = 'Draft' | 'Active' | 'Disabled';

export type OutputDestinationType = 'LocalFileSystem' | 'AzureBlobStorage';

export interface LocalFileSystemDestination {
  type: 'LocalFileSystem';
  local: { basePath: string };
  blob?: null;
}

export interface AzureBlobStorageDestination {
  type: 'AzureBlobStorage';
  blob: {
    connectionStringRef: string;
    container: string;
    pathPrefix?: string | null;
  };
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
```

### 4.2 process-version.model.ts

```typescript
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type DslProfile = 'jsonata' | 'jmespath' | 'custom';

export interface SourceRequestDto {
  method: HttpMethod;
  path: string;
  headers?: Record<string, string> | null;
  queryParams?: Record<string, string> | null;
}

export interface DslDto {
  profile: DslProfile;
  text: string;
}

export interface ProcessVersionDto {
  processId: string;
  version: number;
  enabled: boolean;
  sourceRequest: SourceRequestDto;
  dsl: DslDto;
  outputSchema: any;
  sampleInput?: any;
  createdAt?: string | null;
  updatedAt?: string | null;
}
```

### 4.3 connector.model.ts

```typescript
export interface ConnectorDto {
  id: string;
  name: string;
  baseUrl: string;
  authRef: string;
  timeoutSeconds: number;
  enabled?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}
```

### 4.4 preview.model.ts

```typescript
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
```

### 4.5 ai.model.ts

```typescript
export interface DslGenerateConstraints {
  maxColumns: number;
  allowTransforms: boolean;
  forbidNetworkCalls: boolean;
  forbidCodeExecution: boolean;
}

export interface DslGenerateRequest {
  goalText: string;
  sampleInput: any;
  dslProfile: 'jsonata' | 'jmespath';
  constraints: DslGenerateConstraints;
  hints?: Record<string, string> | null;
  existingDsl?: string | null;
  existingOutputSchema?: any;
}

export interface DslGenerateResult {
  dsl: DslDto;
  outputSchema: any;
  exampleRows?: any[] | null;
  rationale: string;
  warnings: string[];
  modelInfo?: {
    provider?: string;
    model?: string;
    promptVersion?: string;
  } | null;
}
```

### 4.6 ui-error.model.ts

```typescript
export interface UiError {
  title: string;
  message: string;
  code?: string;
  details?: string;
  requestId?: string;
  canRetry?: boolean;
}

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
```

---

## 5. Componentes Shared

### 5.1 MsPageHeader
- **Inputs:** title, subtitle?, breadcrumbs?, primaryAction?, secondaryActions?, dirty?
- **Outputs:** onAction(id: string)

### 5.2 MsStatusChip
- **Inputs:** status ('Draft' | 'Active' | 'Disabled'), size? ('sm' | 'md')

### 5.3 MsErrorBanner
- **Inputs:** error (UiError), visible
- **Outputs:** onRetry(), onCopyDetails(), onDismiss()

### 5.4 MsConfirmDialog
- **Inputs:** title, message, confirmLabel, cancelLabel
- **Outputs:** onConfirm(), onCancel()

### 5.5 MsJsonEditorLite
- **Inputs:** title, valueText, mode ('json' | 'text'), readOnly?, height?
- **Outputs:** onChange(valueText), onValidJson?(valueObj)

### 5.6 MsKeyValueEditor
- **Inputs:** title, value ({key, value}[]), placeholderKey?, placeholderValue?, disabled?
- **Outputs:** onChange(next)

### 5.7 MsFormFooter
- **Inputs:** primary (ActionButton), secondary? (ActionButton[]), sticky?
- **Outputs:** onAction(id)

---

## 6. Interceptors

### 6.1 CorrelationIdInterceptor
Adiciona header `X-Correlation-Id` em todas as requisições.

### 6.2 ErrorInterceptor
Intercepta erros HTTP e converte para `UiError`:
- 400 → Validation error
- 404 → Not found
- 409 → Conflict
- 500 → Internal error
- Network error → Connection error

---

## 7. Guards

### 7.1 UnsavedChangesGuard
Implementa `CanDeactivate` para prevenir navegação com alterações não salvas.
Exibe `MsConfirmDialog` com opções "Stay" / "Discard".

---

## 8. Validações (validators.ts)

```typescript
export function validateRequired(value: string): string | null;
export function validateUrl(value: string): string | null;
export function validateJson(value: string): string | null;
export function validateMinValue(value: number, min: number): string | null;
export function validateNoDuplicateKeys(items: {key: string}[]): string | null;
```

---

## 9. Normalização (normalizers.ts)

```typescript
export function normalizeString(value: string): string;
export function normalizeProcess(dto: ProcessDto): ProcessDto;
export function normalizeProcessVersion(dto: ProcessVersionDto): ProcessVersionDto;
export function normalizeConnector(dto: ConnectorDto): ConnectorDto;
export function normalizeKeyValueMap(items: {key: string, value: string}[]): Record<string, string>;
```

---

## 10. Tema Material 3

### 10.1 Paleta de cores
```scss
$primary-palette: (
  50: #e6eef8,
  100: #b3cce8,
  200: #80aad8,
  300: #4d88c8,
  400: #2670bc,
  500: #003da5,  // Primary
  600: #003594,
  700: #002d82,
  800: #002570,
  900: #001a4d,
);
```

### 10.2 Configuração do tema
```typescript
// Usando Angular Material 17+ com M3
export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptors([
      correlationIdInterceptor,
      errorInterceptor
    ])),
    provideRouter(routes),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' }
    }
  ]
};
```

---

## 11. Alinhamento com Spec Deck

| Requisito | Implementação |
|-----------|---------------|
| Angular 17+ | ✅ Standalone Components |
| Material Design 3 | ✅ Angular Material com tema M3 |
| Reactive Forms | ✅ FormGroup/FormControl |
| REST via HttpClient | ✅ Services com HttpClient |
| Contratos OpenAPI | ✅ Modelos TypeScript derivados |
| Sem NgRx/Redux | ✅ Services como fonte de verdade |
| Lazy loading | ✅ loadChildren/loadComponent |
| Testes Jasmine/Jest | ✅ Configuração padrão Angular |

---

**Próximo passo:** FASE 3 — Implementação do código Angular
