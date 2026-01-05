import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProcessDto } from '../../../shared/models/process.model';
import { normalizeProcess } from '../../../shared/utils/normalizers';
import { RuntimeConfigService } from '../runtime-config.service';

/**
 * ProcessesService - Cliente de API para Processes
 * Endpoints: /api/processes
 */
@Injectable({
  providedIn: 'root'
})
export class ProcessesService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(RuntimeConfigService);
  
  private get baseUrl(): string {
    return `${this.config.apiBaseUrl}/processes`;
  }

  /**
   * Lista todos os processes
   * GET /api/processes
   */
  list(): Observable<ProcessDto[]> {
    return this.http.get<ProcessDto[]>(this.baseUrl);
  }

  /**
   * Obtém um process por ID
   * GET /api/processes/{id}
   */
  get(id: string): Observable<ProcessDto> {
    return this.http.get<ProcessDto>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }

  /**
   * Cria um novo process
   * POST /api/processes
   */
  create(dto: ProcessDto): Observable<ProcessDto> {
    const normalized = normalizeProcess(dto);
    return this.http.post<ProcessDto>(this.baseUrl, normalized);
  }

  /**
   * Atualiza um process existente
   * PUT /api/processes/{id}
   */
  update(id: string, dto: ProcessDto): Observable<ProcessDto> {
    const normalized = normalizeProcess(dto);
    return this.http.put<ProcessDto>(`${this.baseUrl}/${encodeURIComponent(id)}`, normalized);
  }

  /**
   * Deleta um process
   * DELETE /api/processes/{id}
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }
}
