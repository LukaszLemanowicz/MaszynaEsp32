import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LastUpdateComponent } from './last-update.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('LastUpdateComponent', () => {
  let component: LastUpdateComponent;
  let fixture: ComponentFixture<LastUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LastUpdateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LastUpdateComponent);
    component = fixture.componentInstance;
  });

  it('powinien utworzyć komponent', () => {
    expect(component).toBeTruthy();
  });

  it('powinien zwrócić "Brak danych" dla null', () => {
    component.lastUpdate = null;
    expect(component.getFormattedTime()).toBe('Brak danych');
  });

  it('powinien zwrócić sformatowany czas dla daty', () => {
    const date = new Date('2024-01-01T12:00:00.000Z');
    component.lastUpdate = date.toISOString();
    const result = component.getFormattedTime();
    expect(result).toContain('2024');
  });
});
