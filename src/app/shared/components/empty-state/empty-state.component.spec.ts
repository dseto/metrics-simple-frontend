import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('content display', () => {
    it('should display custom icon', () => {
      component.icon = 'folder_open';
      fixture.detectChanges();

      const iconElement = fixture.nativeElement.querySelector('.empty-icon');
      expect(iconElement.textContent).toContain('folder_open');
    });

    it('should display custom title', () => {
      component.title = 'No items found';
      fixture.detectChanges();

      const titleElement = fixture.nativeElement.querySelector('.empty-title');
      expect(titleElement.textContent).toContain('No items found');
    });

    it('should display custom description', () => {
      component.description = 'Create your first item to get started.';
      fixture.detectChanges();

      const descElement = fixture.nativeElement.querySelector('.empty-description');
      expect(descElement.textContent).toContain('Create your first item');
    });
  });

  describe('action button', () => {
    it('should show action button when actionLabel is provided', () => {
      component.actionLabel = 'Create Item';
      fixture.detectChanges();

      const buttonElement = fixture.nativeElement.querySelector('button');
      expect(buttonElement).toBeTruthy();
      expect(buttonElement.textContent).toContain('Create Item');
    });

    it('should hide action button when actionLabel is not provided', () => {
      component.actionLabel = undefined;
      fixture.detectChanges();

      const buttonElement = fixture.nativeElement.querySelector('button');
      expect(buttonElement).toBeFalsy();
    });

    it('should show action icon when provided', () => {
      component.actionLabel = 'Create Item';
      component.actionIcon = 'add';
      fixture.detectChanges();

      const buttonIcon = fixture.nativeElement.querySelector('button mat-icon');
      expect(buttonIcon).toBeTruthy();
      expect(buttonIcon.textContent).toContain('add');
    });

    it('should emit onAction when button is clicked', () => {
      component.actionLabel = 'Create Item';
      fixture.detectChanges();

      spyOn(component.onAction, 'emit');

      const buttonElement = fixture.nativeElement.querySelector('button');
      buttonElement.click();

      expect(component.onAction.emit).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have data-testid attribute', () => {
      fixture.detectChanges();

      const element = fixture.nativeElement.querySelector('[data-testid="empty-state"]');
      expect(element).toBeTruthy();
    });

    it('should have data-testid on action button', () => {
      component.actionLabel = 'Create Item';
      fixture.detectChanges();

      const buttonElement = fixture.nativeElement.querySelector('[data-testid="empty-state.action"]');
      expect(buttonElement).toBeTruthy();
    });
  });
});
