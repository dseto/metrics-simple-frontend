import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorBannerComponent } from './error-banner.component';
import { UiError } from '../../models/api-error.model';

describe('ErrorBannerComponent', () => {
  let component: ErrorBannerComponent;
  let fixture: ComponentFixture<ErrorBannerComponent>;

  const mockError: UiError = {
    title: 'Test Error',
    message: 'Test error message',
    code: 'TEST_ERROR',
    canRetry: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorBannerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorBannerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('visibility', () => {
    it('should be hidden when visible is false', () => {
      component.visible = false;
      component.error = mockError;
      fixture.detectChanges();

      const bannerElement = fixture.nativeElement.querySelector('.error-banner');
      expect(bannerElement).toBeFalsy();
    });

    it('should be visible when visible is true', () => {
      component.visible = true;
      component.error = mockError;
      fixture.detectChanges();

      const bannerElement = fixture.nativeElement.querySelector('.error-banner');
      expect(bannerElement).toBeTruthy();
    });

    it('should be hidden when error is undefined', () => {
      component.visible = true;
      component.error = undefined;
      fixture.detectChanges();

      const bannerElement = fixture.nativeElement.querySelector('.error-banner');
      expect(bannerElement).toBeFalsy();
    });
  });

  describe('error display', () => {
    beforeEach(() => {
      component.visible = true;
      component.error = mockError;
      fixture.detectChanges();
    });

    it('should display error message', () => {
      const messageElement = fixture.nativeElement.querySelector('.error-message');
      expect(messageElement.textContent).toContain('Test error message');
    });

    it('should display error icon', () => {
      const iconElement = fixture.nativeElement.querySelector('mat-icon');
      expect(iconElement).toBeTruthy();
    });
  });

  describe('retry button', () => {
    it('should show retry button when error is retryable', () => {
      component.visible = true;
      component.error = { ...mockError, canRetry: true };
      fixture.detectChanges();

      const retryButton = fixture.nativeElement.querySelector('[data-testid="error-banner.retry"]');
      expect(retryButton).toBeTruthy();
    });

    it('should hide retry button when error is not retryable', () => {
      component.visible = true;
      component.error = { ...mockError, canRetry: false };
      fixture.detectChanges();

      const retryButton = fixture.nativeElement.querySelector('[data-testid="error-banner.retry"]');
      expect(retryButton).toBeFalsy();
    });

    it('should emit onRetry when retry button is clicked', () => {
      component.visible = true;
      component.error = { ...mockError, canRetry: true };
      fixture.detectChanges();

      spyOn(component.onRetry, 'emit');

      const retryButton = fixture.nativeElement.querySelector('[data-testid="error-banner.retry"]');
      retryButton.click();

      expect(component.onRetry.emit).toHaveBeenCalled();
    });
  });

  describe('dismiss button', () => {
    it('should show dismiss button', () => {
      component.visible = true;
      component.error = mockError;
      fixture.detectChanges();

      const dismissButton = fixture.nativeElement.querySelector('[data-testid="error-banner.dismiss"]');
      expect(dismissButton).toBeTruthy();
    });

    it('should emit onDismiss when dismiss button is clicked', () => {
      component.visible = true;
      component.error = mockError;
      fixture.detectChanges();

      spyOn(component.onDismiss, 'emit');

      const dismissButton = fixture.nativeElement.querySelector('[data-testid="error-banner.dismiss"]');
      dismissButton.click();

      expect(component.onDismiss.emit).toHaveBeenCalled();
    });
  });
});
