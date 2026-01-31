import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PowerControlComponent } from './power-control.component';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('PowerControlComponent', () => {
  let component: PowerControlComponent;
  let fixture: ComponentFixture<PowerControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PowerControlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PowerControlComponent);
    component = fixture.componentInstance;
  });

  it('powinien utworzyć komponent', () => {
    expect(component).toBeTruthy();
  });

  it('powinien wyemitować toggle event', () => {
    const spy = vi.fn();
    component.toggle.subscribe(spy);
    component.isOn = false;
    component.disabled = false;
    component.loading = false;

    component.onToggle();

    expect(spy).toHaveBeenCalledWith(true);
  });

  it('nie powinien wyemitować event gdy disabled', () => {
    const spy = vi.fn();
    component.toggle.subscribe(spy);
    component.disabled = true;

    component.onToggle();

    expect(spy).not.toHaveBeenCalled();
  });
});
