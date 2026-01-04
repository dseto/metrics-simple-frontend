import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should provide apiBaseUrl', () => {
    expect(service.apiBaseUrl).toBeTruthy();
    expect(typeof service.apiBaseUrl).toBe('string');
  });

  it('should provide isProduction flag', () => {
    expect(typeof service.isProduction).toBe('boolean');
  });

  it('should provide isAiEnabled flag', () => {
    expect(typeof service.isAiEnabled).toBe('boolean');
  });

  it('should provide environmentName', () => {
    expect(service.environmentName).toBeTruthy();
    expect(typeof service.environmentName).toBe('string');
  });

  it('should return all environment config', () => {
    const config = service.getAll();
    expect(config).toBeTruthy();
    expect(config.apiBaseUrl).toBeTruthy();
    expect(config.production).toBeDefined();
  });
});
