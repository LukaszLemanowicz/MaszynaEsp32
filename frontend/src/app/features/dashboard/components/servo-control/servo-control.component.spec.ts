import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ServoControlComponent } from './servo-control.component';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ServoControlComponent', () => {
  let component: ServoControlComponent;
  let fixture: ComponentFixture<ServoControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServoControlComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ServoControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('powinien utworzyć komponent', () => {
    expect(component).toBeTruthy();
  });

  it('powinien wyemitować valueChange event', () => {
    const spy = vi.fn();
    component.valueChange.subscribe(spy);
    component.disabled = false;
    component.loading = false;
    component.servoForm.patchValue({ value: 50 });

    component.onSubmit();

    expect(spy).toHaveBeenCalledWith(50);
  });

  it('nie powinien wyemitować event gdy formularz jest nieprawidłowy', () => {
    const spy = vi.fn();
    component.valueChange.subscribe(spy);
    component.servoForm.patchValue({ value: 150 }); // Nieprawidłowa wartość

    component.onSubmit();

    expect(spy).not.toHaveBeenCalled();
  });
});
