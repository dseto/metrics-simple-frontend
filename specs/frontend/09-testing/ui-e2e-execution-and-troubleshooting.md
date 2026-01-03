# UI E2E Execution & Troubleshooting

## Execução local
1) `npm run start:e2e`
2) `dotnet test tests/ui-e2e/MetricsSimple.UiE2E.Tests.csproj`

## Artefatos em falha
Salvar screenshot, html e log em `E2E_ARTIFACTS_DIR`.

## Diagnóstico de flakiness
- Verificar waits (spinner/disabled)
- Overlays do Material podem interceptar click: usar wait de clickability
