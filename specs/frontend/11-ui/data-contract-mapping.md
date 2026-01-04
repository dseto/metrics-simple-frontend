
# UI ↔ API Contract Mapping

Base:
- `specs/03-interfaces/openapi-config-api.yaml`
- `specs/02-domain/schemas/*.schema.json`

## Process
- GET/POST /api/v1/processes
- GET/PUT/DELETE /api/v1/processes/{id}

Campos UI: id, name, status, connectorId, outputDestinations.

## ProcessVersion
- POST /api/v1/processes/{id}/versions
- GET/PUT /api/v1/processes/{id}/versions/{version}

Campos: enabled, sourceRequest, dsl, outputSchema, sampleInput.

## Connector
- GET/POST /api/v1/connectors

Campos: id, name, baseUrl, authRef, timeoutSeconds.

## Preview
- POST /api/v1/preview/transform
