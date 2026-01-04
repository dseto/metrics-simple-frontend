# 💻 Development - Metrics Simple Frontend

Documentação para desenvolvedores: stack, escopo, guidelines e refatorações.

---

## 📋 Documentos Disponíveis

### 🎯 [SCOPE.md](SCOPE.md)
**Escopo do projeto**
- Objetivos do sistema
- Features implementadas
- Limites do escopo
- Roadmap
- Ideal para: entender o que o sistema faz

### 🛠️ [TECH_STACK.md](TECH_STACK.md)
**Stack tecnológica**
- Angular 17+
- Material Design 3
- TypeScript
- Bibliotecas utilizadas
- Ideal para: novos desenvolvedores

### 📝 [PROMPTS.md](PROMPTS.md)
**Prompts e guidelines de desenvolvimento**
- Padrões de código
- Convenções
- Guidelines para IA
- Ideal para: manter consistência

### 🔄 [REFACTORING-SUMMARY.md](REFACTORING-SUMMARY.md)
**Resumo de refatorações**
- Mudanças realizadas
- Motivações
- Impacto
- Ideal para: entender evolução do código

---

## 🚀 Setup de Desenvolvimento

### Pré-requisitos
```bash
node --version  # v20.x ou superior
npm --version   # v10.x ou superior
```

### Instalação
```bash
git clone <repository>
cd metrics-simple-frontend
npm install
```

### Comandos Principais
```bash
# Desenvolvimento
npm start                    # http://localhost:4200

# Build
npm run build               # Produção
npm run build:staging       # Staging
npm run build:dev           # Development

# Testes
npm test                    # Rodar testes
npm run test:ci             # CI mode

# Lint & Format
npm run lint                # ESLint
npm run format              # Prettier
```

---

## 📁 Estrutura do Projeto

```
metrics-simple-frontend/
├── src/
│   ├── app/
│   │   ├── core/              # Services, models, interceptors
│   │   ├── features/          # Feature modules (connectors, processes)
│   │   ├── shared/            # Componentes compartilhados
│   │   └── layout/            # Layout e navegação
│   │
│   ├── assets/                # Assets estáticos
│   ├── environments/          # Configurações build-time
│   └── styles/                # Estilos globais
│
├── docs/                      # Documentação (você está aqui!)
├── specs/                     # Spec deck (contratos)
├── tools/                     # Scripts auxiliares
└── docker/                    # Configurações Docker
```

---

## 🎨 Padrões de Código

### Nomenclatura
```typescript
// Classes: PascalCase
export class ConnectorService { }

// Interfaces: PascalCase
export interface Connector { }

// Variáveis/funções: camelCase
const apiBaseUrl = '...';
function loadConnectors() { }

// Constantes: SCREAMING_SNAKE_CASE
const API_VERSION = 'v1';

// Arquivos: kebab-case
connector-list.component.ts
api.service.ts
```

### Estrutura de Components
```typescript
@Component({
  selector: 'app-connector-list',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './connector-list.component.html',
  styleUrls: ['./connector-list.component.scss']
})
export class ConnectorListComponent implements OnInit {
  // 1. Inputs/Outputs
  @Input() connectors: Connector[] = [];
  @Output() selected = new EventEmitter<Connector>();

  // 2. Properties
  loading = false;

  // 3. Dependency Injection
  private readonly service = inject(ConnectorService);

  // 4. Lifecycle
  ngOnInit() { }

  // 5. Public methods
  onSelect(connector: Connector) { }

  // 6. Private methods
  private loadData() { }
}
```

### Services Pattern
```typescript
@Injectable({ providedIn: 'root' })
export class ConnectorService {
  private readonly config = inject(RuntimeConfigService);
  private readonly http = inject(HttpClient);

  private get baseUrl(): string {
    return `${this.config.apiBaseUrl}/connectors`;
  }

  list(): Observable<Connector[]> {
    return this.http.get<Connector[]>(this.baseUrl);
  }
}
```

---

## 🧪 Testes

### Estrutura de Testes
```typescript
describe('ConnectorService', () => {
  let service: ConnectorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ConnectorService,
        { provide: RuntimeConfigService, useValue: mockConfig }
      ]
    });
    service = TestBed.inject(ConnectorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should list connectors', () => {
    // Arrange
    const mockData = [{ id: '1', name: 'Test' }];

    // Act
    service.list().subscribe(result => {
      // Assert
      expect(result).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${baseUrl}/connectors`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
```

---

## 🔧 Ferramentas de Desenvolvimento

### VS Code Extensions (Recomendadas)
- Angular Language Service
- ESLint
- Prettier
- Angular Snippets
- GitLens

### DevTools
- Angular DevTools (Chrome Extension)
- Redux DevTools (se usar NgRx)

### Scripts Úteis
```bash
# Build helpers
./build-helper.sh --env=staging
./build-helper.ps1 -Environment production

# Docker helpers
./docker-manager.sh build
./docker-manager.ps1 -Action Run

# Spec validation
./tools/spec-validate.sh
```

---

## 📚 Documentação de Referência

### Angular
- [Angular Docs](https://angular.dev/)
- [Angular Material](https://material.angular.io/)
- [RxJS](https://rxjs.dev/)

### Specs
- [Backend Specs](../../specs/backend/)
- [Frontend Specs](../../specs/frontend/)
- [Shared Specs](../../specs/shared/)

### Arquitetura
- [Arquitetura](../architecture/)
- [Configuração](../configuration/)
- [Deployment](../deployment/)

---

## 🐛 Debugging

### Console Logs
```typescript
// Development only
if (!environment.production) {
  console.log('Debug:', data);
}
```

### Network Requests
- Use Chrome DevTools → Network
- Verifique headers (correlationId)
- Valide response shape contra schemas

### Breakpoints
```typescript
// TypeScript breakpoint
debugger;

// Template breakpoint (Chrome DevTools)
<div (click)="debug()">{{ value }}</div>
```

---

## 🔗 Links Relacionados

- [Tutorial End-to-End](../TUTORIAL-END-TO-END.md)
- [Architecture](../architecture/)
- [Configuration](../configuration/)
- [README Principal](../../README.md)
