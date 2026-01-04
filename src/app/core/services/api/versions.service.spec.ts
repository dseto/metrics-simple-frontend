import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VersionsService } from './versions.service';
import { ProcessVersionDto } from '../../../shared/models/process-version.model';
import { environment } from '../../../../environments/environment';

describe('VersionsService', () => {
  let service: VersionsService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiBaseUrl}/processes`;

  const mockVersion: ProcessVersionDto = {
    processId: 'test-process',
    version: 1,
    enabled: true,
    sourceRequest: {
      method: 'GET',
      path: '/api/data',
      headers: { 'Content-Type': 'application/json' },
      queryParams: {}
    },
    dsl: {
      profile: 'jsonata',
      text: '$.data'
    },
    outputSchema: { type: 'object' },
    sampleInput: { data: [] }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VersionsService]
    });

    service = TestBed.inject(VersionsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('list', () => {
    it('should return a list of versions for a process', () => {
      const mockVersions: ProcessVersionDto[] = [mockVersion];

      service.list('test-process').subscribe(versions => {
        expect(versions).toEqual(mockVersions);
        expect(versions.length).toBe(1);
      });

      const req = httpMock.expectOne(`${baseUrl}/test-process/versions`);
      expect(req.request.method).toBe('GET');
      req.flush(mockVersions);
    });
  });

  describe('get', () => {
    it('should return a single version by process ID and version number', () => {
      service.get('test-process', 1).subscribe(version => {
        expect(version).toEqual(mockVersion);
        expect(version.version).toBe(1);
      });

      const req = httpMock.expectOne(`${baseUrl}/test-process/versions/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockVersion);
    });
  });

  describe('create', () => {
    it('should create a new version', () => {
      const newVersion: ProcessVersionDto = { ...mockVersion, version: 2 };

      service.create('test-process', newVersion).subscribe(version => {
        expect(version).toEqual(newVersion);
      });

      const req = httpMock.expectOne(`${baseUrl}/test-process/versions`);
      expect(req.request.method).toBe('POST');
      req.flush(newVersion);
    });
  });

  describe('update', () => {
    it('should update an existing version', () => {
      const updatedVersion: ProcessVersionDto = { ...mockVersion, enabled: false };

      service.update('test-process', 1, updatedVersion).subscribe(version => {
        expect(version.enabled).toBe(false);
      });

      const req = httpMock.expectOne(`${baseUrl}/test-process/versions/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(updatedVersion);
    });
  });

  describe('delete', () => {
    it('should delete a version', () => {
      service.delete('test-process', 1).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${baseUrl}/test-process/versions/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
