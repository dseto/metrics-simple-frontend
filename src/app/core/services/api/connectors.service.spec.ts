import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConnectorsService } from './connectors.service';
import { ConnectorDto } from '../../../shared/models/connector.model';
import { environment } from '../../../../environments/environment';

describe('ConnectorsService', () => {
  let service: ConnectorsService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiBaseUrl}/connectors`;

  const mockConnector: ConnectorDto = {
    id: 'test-connector',
    name: 'Test Connector',
    baseUrl: 'https://api.example.com',
    authRef: 'API_KEY',
    timeoutSeconds: 60,
    enabled: true,
    hasApiToken: false
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

      const req = httpMock.expectOne(baseUrl);
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

      const req = httpMock.expectOne(`${baseUrl}/test-connector`);
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

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      req.flush(newConnector);
    });

    it('should create connector with apiToken', () => {
      const newConnector: ConnectorDto = { 
        ...mockConnector, 
        id: 'new-connector',
        apiToken: 'secret-token'
      };

      service.create(newConnector).subscribe();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.body.apiToken).toBe('secret-token');
      expect(req.request.body.hasApiToken).toBeUndefined(); // read-only
      req.flush({...newConnector, hasApiToken: true});
    });
  });

  describe('update', () => {
    it('should update an existing connector', () => {
      const updatedConnector: ConnectorDto = { ...mockConnector, name: 'Updated Name' };

      service.update('test-connector', updatedConnector).subscribe(connector => {
        expect(connector.name).toBe('Updated Name');
      });

      const req = httpMock.expectOne(`${baseUrl}/test-connector`);
      expect(req.request.method).toBe('PUT');
      req.flush(updatedConnector);
    });

    it('should update with apiToken=null to clear token', () => {
      const updatedConnector: ConnectorDto = { 
        ...mockConnector, 
        apiToken: null 
      };

      service.update('test-connector', updatedConnector).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/test-connector`);
      expect(req.request.body.apiToken).toBeNull();
      req.flush({...updatedConnector, hasApiToken: false});
    });

    it('should update with new apiToken', () => {
      const updatedConnector: ConnectorDto = { 
        ...mockConnector, 
        apiToken: 'new-secret-token' 
      };

      service.update('test-connector', updatedConnector).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/test-connector`);
      expect(req.request.body.apiToken).toBe('new-secret-token');
      req.flush({...updatedConnector, hasApiToken: true});
    });

    it('should update without apiToken field (keeps existing)', () => {
      const updatedConnector: ConnectorDto = { 
        ...mockConnector, 
        name: 'Updated Name'
        // apiToken não presente => deve ser omitido no payload
      };

      service.update('test-connector', updatedConnector).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/test-connector`);
      expect('apiToken' in req.request.body).toBe(false);
      req.flush(updatedConnector);
    });
  });

  describe('delete', () => {
    it('should delete a connector', () => {
      service.delete('test-connector').subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${baseUrl}/test-connector`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
