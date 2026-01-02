import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusChipComponent } from './status-chip.component';
import { ProcessStatus } from '../../models/process.model';

describe('StatusChipComponent', () => {
  let component: StatusChipComponent;
  let fixture: ComponentFixture<StatusChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusChipComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusChipComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('status display', () => {
    it('should display Active status correctly', () => {
      component.status = 'Active';
      fixture.detectChanges();

      const chipElement = fixture.nativeElement.querySelector('.status-chip');
      expect(chipElement.textContent.trim()).toBe('Ativo');
      expect(chipElement.classList).toContain('status-active');
    });

    it('should display Draft status correctly', () => {
      component.status = 'Draft';
      fixture.detectChanges();

      const chipElement = fixture.nativeElement.querySelector('.status-chip');
      expect(chipElement.textContent.trim()).toBe('Rascunho');
      expect(chipElement.classList).toContain('status-draft');
    });

    it('should display Disabled status correctly', () => {
      component.status = 'Disabled';
      fixture.detectChanges();

      const chipElement = fixture.nativeElement.querySelector('.status-chip');
      expect(chipElement.textContent.trim()).toBe('Desativado');
      expect(chipElement.classList).toContain('status-disabled');
    });
  });

  describe('size variants', () => {
    it('should apply small size class', () => {
      component.status = 'Active';
      component.size = 'sm';
      fixture.detectChanges();

      const chipElement = fixture.nativeElement.querySelector('.status-chip');
      expect(chipElement.classList).toContain('size-sm');
    });

    it('should not apply small size class by default', () => {
      component.status = 'Active';
      fixture.detectChanges();

      const chipElement = fixture.nativeElement.querySelector('.status-chip');
      expect(chipElement.classList).not.toContain('size-sm');
    });

    it('should apply medium size by default', () => {
      component.status = 'Active';
      component.size = 'md';
      fixture.detectChanges();

      const chipElement = fixture.nativeElement.querySelector('.status-chip');
      expect(chipElement.classList).not.toContain('size-sm');
    });
  });

  describe('accessibility', () => {
    it('should have data-testid attribute for Active', () => {
      component.status = 'Active';
      fixture.detectChanges();

      const chipElement = fixture.nativeElement.querySelector('[data-testid="status-chip.active"]');
      expect(chipElement).toBeTruthy();
    });

    it('should have data-testid attribute for Draft', () => {
      component.status = 'Draft';
      fixture.detectChanges();

      const chipElement = fixture.nativeElement.querySelector('[data-testid="status-chip.draft"]');
      expect(chipElement).toBeTruthy();
    });

    it('should have data-testid attribute for Disabled', () => {
      component.status = 'Disabled';
      fixture.detectChanges();

      const chipElement = fixture.nativeElement.querySelector('[data-testid="status-chip.disabled"]');
      expect(chipElement).toBeTruthy();
    });
  });

  describe('getLabel method', () => {
    it('should return correct label for Draft', () => {
      component.status = 'Draft';
      expect(component.getLabel()).toBe('Rascunho');
    });

    it('should return correct label for Active', () => {
      component.status = 'Active';
      expect(component.getLabel()).toBe('Ativo');
    });

    it('should return correct label for Disabled', () => {
      component.status = 'Disabled';
      expect(component.getLabel()).toBe('Desativado');
    });
  });
});
