import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AiService } from './ai.service';
import { DslGenerateRequest, DslGenerateResult, createDefaultConstraints } from '../../../shared/models/ai.model';

describe('AiService', () => {
  let service: AiService;
  let httpMock: HttpTestingController;

  const mockRequest: DslGenerateRequest = {
    goalText: 'Extract total sales by quarter',
    sampleInput: {
      sales: [
        { quarter: 'Q1', amount: 1000 },
        { quarter: 'Q2', amount: 1500 }
      ]
    },
    dslProfile: 'jsonata',
    constraints: createDefaultConstraints(),
    existingDsl: null,
    existingOutputSchema: null
  };

  const mockResponse: DslGenerateResult = {
    dsl: {
      profile: 'jsonata',
      text: '$.sales.{ "quarter": quarter, "total": amount }'
    },
    outputSchema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          quarter: { type: 'string' },
          total: { type: 'number' }
        }
      }
    },
    rationale: 'Extracted quarter and amount fields from sales array',
    warnings: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AiService]
    });

    service = TestBed.inject(AiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('generateDsl', () => {
    it('should return generated DSL and schema', () => {
      service.generateDsl(mockRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.dsl.profile).toBe('jsonata');
        expect(response.rationale).toBeTruthy();
      });

      const req = httpMock.expectOne('/api/ai/dsl/generate');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRequest);
      req.flush(mockResponse);
    });

    it('should handle AI disabled error', () => {
      service.generateDsl(mockRequest).subscribe({
        error: (error) => {
          expect(error.status).toBe(503);
        }
      });

      const req = httpMock.expectOne('/api/ai/dsl/generate');
      req.flush(
        { code: 'AI_DISABLED', message: 'AI is disabled in this installation' },
        { status: 503, statusText: 'Service Unavailable' }
      );
    });

    it('should handle AI rate limit error', () => {
      service.generateDsl(mockRequest).subscribe({
        error: (error) => {
          expect(error.status).toBe(429);
        }
      });

      const req = httpMock.expectOne('/api/ai/dsl/generate');
      req.flush(
        { code: 'AI_RATE_LIMITED', message: 'Too many requests' },
        { status: 429, statusText: 'Too Many Requests' }
      );
    });

    it('should return warnings when applicable', () => {
      const responseWithWarnings: DslGenerateResult = {
        ...mockResponse,
        warnings: ['Complex nested structure detected', 'Consider simplifying the schema']
      };

      service.generateDsl(mockRequest).subscribe(response => {
        expect(response.warnings.length).toBe(2);
        expect(response.warnings[0]).toContain('Complex');
      });

      const req = httpMock.expectOne('/api/ai/dsl/generate');
      req.flush(responseWithWarnings);
    });
  });
});
