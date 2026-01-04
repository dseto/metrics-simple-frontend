import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProcessesService } from './processes.service';
import { ProcessDto, ProcessStatus } from '../../../shared/models/process.model';
import { environment } from '../../../../environments/environment';

describe('ProcessesService', () => {
  let service: ProcessesService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiBaseUrl}/processes`;

  const mockProcess: ProcessDto = {
    id: 'test-process',
    name: 'Test Process',
    description: 'Test description',
    status: 'Draft' as ProcessStatus,
    connectorId: 'test-connector',
    tags: null,
    outputDestinations: [
      {
        type: 'LocalFileSystem',
        local: { basePath: '/output' }
      }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProcessesService]
    });

    service = TestBed.inject(ProcessesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('list', () => {
    it('should return a list of processes', () => {
      const mockProcesses: ProcessDto[] = [mockProcess];

      service.list().subscribe(processes => {
        expect(processes).toEqual(mockProcesses);
        expect(processes.length).toBe(1);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockProcesses);
    });

    it('should handle empty list', () => {
      service.list().subscribe(processes => {
        expect(processes).toEqual([]);
        expect(processes.length).toBe(0);
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush([]);
    });
  });

  describe('get', () => {
    it('should return a single process by ID', () => {
      service.get('test-process').subscribe(process => {
        expect(process).toEqual(mockProcess);
        expect(process.id).toBe('test-process');
      });

      const req = httpMock.expectOne(`${baseUrl}/test-process`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProcess);
    });

    it('should handle 404 error', () => {
      service.get('non-existent').subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/non-existent`);
      req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('create', () => {
    it('should create a new process', () => {
      const newProcess: ProcessDto = { ...mockProcess, id: 'new-process' };

      service.create(newProcess).subscribe(process => {
        expect(process).toEqual(newProcess);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      req.flush(newProcess);
    });

    it('should handle validation error', () => {
      const invalidProcess: ProcessDto = { ...mockProcess, name: '' };

      service.create(invalidProcess).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush({ message: 'Validation failed' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('update', () => {
    it('should update an existing process', () => {
      const updatedProcess: ProcessDto = { ...mockProcess, name: 'Updated Name' };

      service.update('test-process', updatedProcess).subscribe(process => {
        expect(process.name).toBe('Updated Name');
      });

      const req = httpMock.expectOne(`${baseUrl}/test-process`);
      expect(req.request.method).toBe('PUT');
      req.flush(updatedProcess);
    });
  });

  describe('delete', () => {
    it('should delete a process', () => {
      service.delete('test-process').subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${baseUrl}/test-process`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle delete of non-existent process', () => {
      service.delete('non-existent').subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/non-existent`);
      req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    });
  });
});
