import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProcessVersionDto } from '../../../shared/models/process-version.model';
import { normalizeProcessVersion } from '../../../shared/utils/normalizers';
import { RuntimeConfigService } from '../runtime-config.service';

/**
 * VersionsService - Cliente de API para ProcessVersions
 * Endpoints: /api/processes/{processId}/versions
 */
@Injectable({
  providedIn: 'root'
})
export class VersionsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(RuntimeConfigService);

  private getBaseUrl(processId: string): string {
    return `${this.config.apiBaseUrl}/processes/${encodeURIComponent(processId)}/versions`;
  }

  /**
   * Lista todas as versions de um process
   * GET /api/processes/{processId}/versions
   */
  list(processId: string): Observable<ProcessVersionDto[]> {
    return this.http.get<ProcessVersionDto[]>(this.getBaseUrl(processId));
  }

  /**
   * Obtém uma version específica
   * GET /api/processes/{processId}/versions/{version}
   */
  get(processId: string, version: number): Observable<ProcessVersionDto> {
    return this.http.get<ProcessVersionDto>(`${this.getBaseUrl(processId)}/${version}`);
  }

  /**
   * Cria uma nova version
   * POST /api/processes/{processId}/versions
   */
  create(processId: string, dto: ProcessVersionDto): Observable<ProcessVersionDto> {
    const normalized = normalizeProcessVersion(dto);
    return this.http.post<ProcessVersionDto>(this.getBaseUrl(processId), normalized);
  }

  /**
   * Atualiza uma version existente
   * PUT /api/processes/{processId}/versions/{version}
   */
  update(processId: string, version: number, dto: ProcessVersionDto): Observable<ProcessVersionDto> {
    const normalized = normalizeProcessVersion(dto);
    return this.http.put<ProcessVersionDto>(`${this.getBaseUrl(processId)}/${version}`, normalized);
  }

  /**
   * Deleta uma version
   * DELETE /api/processes/{processId}/versions/{version}
   */
  delete(processId: string, version: number): Observable<void> {
    return this.http.delete<void>(`${this.getBaseUrl(processId)}/${version}`);
  }
}
