import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PreviewTransformRequest, PreviewTransformResponse } from '../../../shared/models/preview.model';

/**
 * PreviewService - Cliente de API para Preview Transform
 * Endpoints: /api/preview
 */
@Injectable({
  providedIn: 'root'
})
export class PreviewService {
  private readonly baseUrl = '/api/preview';
  private readonly http = inject(HttpClient);

  /**
   * Executa preview de transformação
   * POST /api/preview/transform
   */
  transform(request: PreviewTransformRequest): Observable<PreviewTransformResponse> {
    return this.http.post<PreviewTransformResponse>(`${this.baseUrl}/transform`, request);
  }
}
