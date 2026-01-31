import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TemperatureDisplayComponent } from './temperature-display.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('TemperatureDisplayComponent', () => {
  let component: TemperatureDisplayComponent;
  let fixture: ComponentFixture<TemperatureDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemperatureDisplayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TemperatureDisplayComponent);
    component = fixture.componentInstance;
  });

  it('powinien utworzyć komponent', () => {
    expect(component).toBeTruthy();
  });

  it('powinien zwrócić tablicę temperatur', () => {
    component.temperature1 = 25.5;
    component.temperature2 = 30.0;
    component.temperature3 = 22.1;
    expect(component.temperatures).toEqual([25.5, 30.0, 22.1]);
  });

  it('powinien zwrócić "N/A" dla null', () => {
    expect(component.getTemperatureDisplay(null)).toBe('N/A');
  });

  it('powinien zwrócić "Błąd" dla -999.0', () => {
    expect(component.getTemperatureDisplay(-999.0)).toBe('Błąd');
  });

  it('powinien zwrócić sformatowaną temperaturę', () => {
    expect(component.getTemperatureDisplay(25.5)).toBe('25.5°C');
  });
});
