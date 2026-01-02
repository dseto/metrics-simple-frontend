import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

/**
 * RunnerHelp - Documentação do CLI Runner
 * Conforme pages/runner-help.md e cli-contract.md
 */
@Component({
  selector: 'ms-runner-help',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent
  ],
  template: `
    <div class="runner-help" data-testid="page.runner">
      <ms-page-header
        title="Runner CLI"
        subtitle="Documentação do executor de métricas">
      </ms-page-header>

      <mat-tab-group>
        <!-- Overview -->
        <mat-tab label="Visão Geral">
          <mat-card class="doc-card">
            <mat-card-content>
              <h2>O que é o Runner?</h2>
              <p>
                O <strong>MetricsSimple Runner</strong> é uma ferramenta de linha de comando (CLI) que executa
                processos de métricas de forma determinística. Ele busca dados de conectores, aplica transformações
                DSL e gera arquivos de saída (JSON/CSV).
              </p>

              <h3>Características</h3>
              <ul>
                <li>Execução 100% determinística (sem dependência de IA em runtime)</li>
                <li>Suporte a múltiplos perfis DSL (JSONata, JMESPath, Custom)</li>
                <li>Saída para sistema de arquivos local ou Azure Blob Storage</li>
                <li>Logs estruturados com correlation ID</li>
                <li>Modo dry-run para validação</li>
              </ul>
            </mat-card-content>
          </mat-card>
        </mat-tab>

        <!-- Installation -->
        <mat-tab label="Instalação">
          <mat-card class="doc-card">
            <mat-card-content>
              <h2>Instalação</h2>

              <h3>Via npm (recomendado)</h3>
              <pre class="code-block">npm install -g metrics-simple-runner</pre>

              <h3>Via Docker</h3>
              <pre class="code-block">docker pull metricssimple/runner:latest</pre>

              <h3>Verificar instalação</h3>
              <pre class="code-block">ms-runner --version</pre>
            </mat-card-content>
          </mat-card>
        </mat-tab>

        <!-- Commands -->
        <mat-tab label="Comandos">
          <mat-card class="doc-card">
            <mat-card-content>
              <h2>Comandos Disponíveis</h2>

              <h3>run</h3>
              <p>Executa um processo de métricas.</p>
              <pre class="code-block">ms-runner run --process-id &lt;id&gt; [--version &lt;n&gt;] [--dry-run]</pre>

              <table class="options-table">
                <thead>
                  <tr>
                    <th>Opção</th>
                    <th>Descrição</th>
                    <th>Obrigatório</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>--process-id, -p</code></td>
                    <td>ID do processo a executar</td>
                    <td>Sim</td>
                  </tr>
                  <tr>
                    <td><code>--version, -v</code></td>
                    <td>Versão específica (default: última habilitada)</td>
                    <td>Não</td>
                  </tr>
                  <tr>
                    <td><code>--dry-run</code></td>
                    <td>Executa sem gravar saída</td>
                    <td>Não</td>
                  </tr>
                  <tr>
                    <td><code>--config, -c</code></td>
                    <td>Caminho para arquivo de configuração</td>
                    <td>Não</td>
                  </tr>
                  <tr>
                    <td><code>--verbose</code></td>
                    <td>Habilita logs detalhados</td>
                    <td>Não</td>
                  </tr>
                </tbody>
              </table>

              <h3>list</h3>
              <p>Lista processos disponíveis.</p>
              <pre class="code-block">ms-runner list [--status &lt;status&gt;]</pre>

              <h3>validate</h3>
              <p>Valida configuração de um processo.</p>
              <pre class="code-block">ms-runner validate --process-id &lt;id&gt;</pre>
            </mat-card-content>
          </mat-card>
        </mat-tab>

        <!-- Configuration -->
        <mat-tab label="Configuração">
          <mat-card class="doc-card">
            <mat-card-content>
              <h2>Configuração</h2>

              <h3>Arquivo de configuração</h3>
              <p>O runner pode ser configurado via arquivo <code>ms-runner.yaml</code> ou variáveis de ambiente.</p>

              <pre class="code-block">
# ms-runner.yaml
api:
  baseUrl: http://localhost:3000
  timeout: 30

logging:
  level: info
  format: json

output:
  defaultPath: ./output
              </pre>

              <h3>Variáveis de ambiente</h3>
              <table class="options-table">
                <thead>
                  <tr>
                    <th>Variável</th>
                    <th>Descrição</th>
                    <th>Default</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>MS_API_URL</code></td>
                    <td>URL da API do MetricsSimple</td>
                    <td>http://localhost:3000</td>
                  </tr>
                  <tr>
                    <td><code>MS_LOG_LEVEL</code></td>
                    <td>Nível de log (debug, info, warn, error)</td>
                    <td>info</td>
                  </tr>
                  <tr>
                    <td><code>MS_OUTPUT_PATH</code></td>
                    <td>Caminho padrão para saída</td>
                    <td>./output</td>
                  </tr>
                </tbody>
              </table>
            </mat-card-content>
          </mat-card>
        </mat-tab>

        <!-- Examples -->
        <mat-tab label="Exemplos">
          <mat-card class="doc-card">
            <mat-card-content>
              <h2>Exemplos de Uso</h2>

              <h3>Executar processo</h3>
              <pre class="code-block">
# Executar processo com ID "sales-metrics"
ms-runner run --process-id sales-metrics

# Executar versão específica
ms-runner run --process-id sales-metrics --version 2

# Executar em modo dry-run (sem gravar saída)
ms-runner run --process-id sales-metrics --dry-run --verbose
              </pre>

              <h3>Listar processos</h3>
              <pre class="code-block">
# Listar todos os processos
ms-runner list

# Listar apenas processos ativos
ms-runner list --status Active
              </pre>

              <h3>Validar processo</h3>
              <pre class="code-block">
# Validar configuração do processo
ms-runner validate --process-id sales-metrics
              </pre>

              <h3>Execução via Docker</h3>
              <pre class="code-block">
docker run -v $(pwd)/output:/output \\
  -e MS_API_URL=http://host.docker.internal:3000 \\
  metricssimple/runner:latest \\
  run --process-id sales-metrics
              </pre>

              <h3>Agendamento com cron</h3>
              <pre class="code-block">
# Executar diariamente às 6h
0 6 * * * /usr/local/bin/ms-runner run --process-id sales-metrics
              </pre>
            </mat-card-content>
          </mat-card>
        </mat-tab>

        <!-- Exit Codes -->
        <mat-tab label="Códigos de Saída">
          <mat-card class="doc-card">
            <mat-card-content>
              <h2>Códigos de Saída</h2>

              <table class="options-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Significado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>0</code></td>
                    <td>Sucesso</td>
                  </tr>
                  <tr>
                    <td><code>1</code></td>
                    <td>Erro genérico</td>
                  </tr>
                  <tr>
                    <td><code>2</code></td>
                    <td>Erro de configuração</td>
                  </tr>
                  <tr>
                    <td><code>3</code></td>
                    <td>Processo não encontrado</td>
                  </tr>
                  <tr>
                    <td><code>4</code></td>
                    <td>Erro de conexão com API</td>
                  </tr>
                  <tr>
                    <td><code>5</code></td>
                    <td>Erro de conexão com conector</td>
                  </tr>
                  <tr>
                    <td><code>6</code></td>
                    <td>Erro de transformação DSL</td>
                  </tr>
                  <tr>
                    <td><code>7</code></td>
                    <td>Erro de validação de saída</td>
                  </tr>
                  <tr>
                    <td><code>8</code></td>
                    <td>Erro de gravação de saída</td>
                  </tr>
                </tbody>
              </table>
            </mat-card-content>
          </mat-card>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .runner-help {
      max-width: 1000px;
      margin: 0 auto;
    }

    .doc-card {
      margin: 24px 0;
    }

    .doc-card h2 {
      margin-top: 0;
      color: var(--mat-sys-primary);
    }

    .doc-card h3 {
      margin-top: 24px;
      margin-bottom: 8px;
    }

    .doc-card p {
      line-height: 1.6;
    }

    .doc-card ul {
      line-height: 1.8;
    }

    .code-block {
      background: #1E1E1E;
      color: #D4D4D4;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 13px;
      line-height: 1.5;
    }

    .options-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }

    .options-table th,
    .options-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }

    .options-table th {
      background: var(--mat-sys-surface-container);
      font-weight: 500;
    }

    .options-table code {
      background: #F5F5F5;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
    }
  `]
})
export class RunnerHelpComponent {}
