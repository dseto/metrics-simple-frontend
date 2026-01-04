import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PreviewService } from './preview.service';
import { PreviewTransformRequest, PreviewTransformResponse } from '../../../shared/models/preview.model';
import { environment } from '../../../../environments/environment';

describe('PreviewService', () => {
  let service: PreviewService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiBaseUrl}/preview`;

  const mockRequest: PreviewTransformRequest = {
    dsl: {
      profile: 'jsonata',
      text: '$.data'
    },
    outputSchema: {
      type: 'object',
      properties: {
        total: { type: 'number' }
      }
    },
    sampleInput: {
      data: { total: 100 }
    }
  };

  const mockResponse: PreviewTransformResponse = {
    output: { total: 100 },
    isValid: true,
    errors: [],
    previewCsv: 'total\n100'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PreviewService]
    });

    service = TestBed.inject(PreviewService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('transform', () => {
    it('should return preview result for valid transformation', () => {
      service.transform(mockRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.isValid).toBe(true);
        expect(response.errors.length).toBe(0);
      });

      const req = httpMock.expectOne(`${baseUrl}/transform`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRequest);
      req.flush(mockResponse);
    });

    it('should return validation errors for invalid transformation', () => {
      const errorResponse: PreviewTransformResponse = {
        output: null,
        isValid: false,
        errors: [
          { path: '$.total', message: 'Expected number, got string', kind: 'type_mismatch' }
        ],
        previewCsv: null
      };

      service.transform(mockRequest).subscribe(response => {
        expect(response.isValid).toBe(false);
        expect(response.errors.length).toBe(1);
        expect(response.errors[0].path).toBe('$.total');
      });

      const req = httpMock.expectOne(`${baseUrl}/transform`);
      req.flush(errorResponse);
    });

    it('should handle server error', () => {
      service.transform(mockRequest).subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/transform`);
      req.flush({ message: 'Internal server error' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
