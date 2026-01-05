import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PreviewTransformRequest, PreviewTransformResponse } from '../../../shared/models/preview.model';
import { RuntimeConfigService } from '../runtime-config.service';

/**
 * PreviewService - Cliente de API para Preview Transform
 * Endpoints: /api/preview
 */
@Injectable({
  providedIn: 'root'
})
export class PreviewService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(RuntimeConfigService);
  
  private get baseUrl(): string {
    return `${this.config.apiBaseUrl}/preview`;
  }

  /**
   * Executa preview de transformação
   * POST /api/preview/transform
   */
  transform(request: PreviewTransformRequest): Observable<PreviewTransformResponse> {
    return this.http.post<PreviewTransformResponse>(`${this.baseUrl}/transform`, request);
  }
}
