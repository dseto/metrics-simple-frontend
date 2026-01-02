import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConnectorsService } from './connectors.service';
import { ConnectorDto } from '../../../shared/models/connector.model';

describe('ConnectorsService', () => {
  let service: ConnectorsService;
  let httpMock: HttpTestingController;

  const mockConnector: ConnectorDto = {
    id: 'test-connector',
    name: 'Test Connector',
    baseUrl: 'https://api.example.com',
    authRef: 'API_KEY',
    timeoutSeconds: 60,
    enabled: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConnectorsService]
    });

    service = TestBed.inject(ConnectorsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('list', () => {
    it('should return a list of connectors', () => {
      const mockConnectors: ConnectorDto[] = [mockConnector];

      service.list().subscribe(connectors => {
        expect(connectors).toEqual(mockConnectors);
        expect(connectors.length).toBe(1);
      });

      const req = httpMock.expectOne('/api/connectors');
      expect(req.request.method).toBe('GET');
      req.flush(mockConnectors);
    });
  });

  describe('get', () => {
    it('should return a single connector by ID', () => {
      service.get('test-connector').subscribe(connector => {
        expect(connector).toEqual(mockConnector);
        expect(connector.id).toBe('test-connector');
      });

      const req = httpMock.expectOne('/api/connectors/test-connector');
      expect(req.request.method).toBe('GET');
      req.flush(mockConnector);
    });
  });

  describe('create', () => {
    it('should create a new connector', () => {
      const newConnector: ConnectorDto = { ...mockConnector, id: 'new-connector' };

      service.create(newConnector).subscribe(connector => {
        expect(connector).toEqual(newConnector);
      });

      const req = httpMock.expectOne('/api/connectors');
      expect(req.request.method).toBe('POST');
      req.flush(newConnector);
    });
  });

  describe('update', () => {
    it('should update an existing connector', () => {
      const updatedConnector: ConnectorDto = { ...mockConnector, name: 'Updated Name' };

      service.update('test-connector', updatedConnector).subscribe(connector => {
        expect(connector.name).toBe('Updated Name');
      });

      const req = httpMock.expectOne('/api/connectors/test-connector');
      expect(req.request.method).toBe('PUT');
      req.flush(updatedConnector);
    });
  });

  describe('delete', () => {
    it('should delete a connector', () => {
      service.delete('test-connector').subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne('/api/connectors/test-connector');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
