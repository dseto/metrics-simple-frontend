import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConnectorDto } from '../../../shared/models/connector.model';
import { normalizeConnector } from '../../../shared/utils/normalizers';

/**
 * ConnectorsService - Cliente de API para Connectors
 * Endpoints: /api/connectors
 */
@Injectable({
  providedIn: 'root'
})
export class ConnectorsService {
  private readonly baseUrl = '/api/connectors';
  private readonly http = inject(HttpClient);

  /**
   * Lista todos os connectors
   * GET /api/connectors
   */
  list(): Observable<ConnectorDto[]> {
    return this.http.get<ConnectorDto[]>(this.baseUrl);
  }

  /**
   * Obtém um connector por ID
   * GET /api/connectors/{id}
   */
  get(id: string): Observable<ConnectorDto> {
    return this.http.get<ConnectorDto>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }

  /**
   * Cria um novo connector
   * POST /api/connectors
   */
  create(dto: ConnectorDto): Observable<ConnectorDto> {
    const normalized = normalizeConnector(dto);
    return this.http.post<ConnectorDto>(this.baseUrl, normalized);
  }

  /**
   * Atualiza um connector existente
   * PUT /api/connectors/{id}
   */
  update(id: string, dto: ConnectorDto): Observable<ConnectorDto> {
    const normalized = normalizeConnector(dto);
    return this.http.put<ConnectorDto>(`${this.baseUrl}/${encodeURIComponent(id)}`, normalized);
  }

  /**
   * Deleta um connector
   * DELETE /api/connectors/{id}
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }
}
