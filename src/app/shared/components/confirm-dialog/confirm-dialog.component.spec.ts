import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ConfirmDialogComponent>>;

  const mockData: ConfirmDialogData = {
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmLabel: 'Yes',
    cancelLabel: 'No'
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: MatDialogRef, useValue: dialogRefSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('content display', () => {
    it('should display the title', () => {
      const titleElement = fixture.nativeElement.querySelector('h2');
      expect(titleElement.textContent).toContain('Confirm Action');
    });

    it('should display the message', () => {
      const messageElement = fixture.nativeElement.querySelector('mat-dialog-content p');
      expect(messageElement.textContent).toContain('Are you sure you want to proceed?');
    });

    it('should display custom confirm label', () => {
      const confirmButton = fixture.nativeElement.querySelector('[data-testid="confirm-dialog.confirm"]');
      expect(confirmButton.textContent).toContain('Yes');
    });

    it('should display custom cancel label', () => {
      const cancelButton = fixture.nativeElement.querySelector('[data-testid="confirm-dialog.cancel"]');
      expect(cancelButton.textContent).toContain('No');
    });
  });

  describe('button actions', () => {
    it('should close dialog with true when confirm is clicked', () => {
      const confirmButton = fixture.nativeElement.querySelector('[data-testid="confirm-dialog.confirm"]');
      confirmButton.click();

      expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
    });

    it('should close dialog with false when cancel is clicked', () => {
      const cancelButton = fixture.nativeElement.querySelector('[data-testid="confirm-dialog.cancel"]');
      cancelButton.click();

      expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
    });
  });

  describe('default labels', () => {
    it('should use default labels when not provided', async () => {
      const defaultData: ConfirmDialogData = {
        title: 'Confirm',
        message: 'Are you sure?'
      };

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [ConfirmDialogComponent],
        providers: [
          { provide: MAT_DIALOG_DATA, useValue: defaultData },
          { provide: MatDialogRef, useValue: dialogRefSpy }
        ]
      }).compileComponents();

      const newFixture = TestBed.createComponent(ConfirmDialogComponent);
      newFixture.detectChanges();

      const confirmButton = newFixture.nativeElement.querySelector('[data-testid="confirm-dialog.confirm"]');
      const cancelButton = newFixture.nativeElement.querySelector('[data-testid="confirm-dialog.cancel"]');

      expect(confirmButton.textContent).toContain('Confirmar');
      expect(cancelButton.textContent).toContain('Cancelar');
    });
  });
});
