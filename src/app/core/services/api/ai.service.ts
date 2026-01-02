import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DslGenerateRequest, DslGenerateResult } from '../../../shared/models/ai.model';

/**
 * AiService - Cliente de API para AI Assistant
 * Endpoints: /api/ai
 */
@Injectable({
  providedIn: 'root'
})
export class AiService {
  private readonly baseUrl = '/api/ai';
  private readonly http = inject(HttpClient);

  /**
   * Gera DSL e Output Schema usando LLM
   * POST /api/ai/dsl/generate
   */
  generateDsl(request: DslGenerateRequest): Observable<DslGenerateResult> {
    return this.http.post<DslGenerateResult>(`${this.baseUrl}/dsl/generate`, request);
  }
}
