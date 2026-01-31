import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommandFeedbackComponent } from './command-feedback.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('CommandFeedbackComponent', () => {
  let component: CommandFeedbackComponent;
  let fixture: ComponentFixture<CommandFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandFeedbackComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommandFeedbackComponent);
    component = fixture.componentInstance;
  });

  it('powinien utworzyć komponent', () => {
    expect(component).toBeTruthy();
  });

  it('powinien mieć domyślne wartości', () => {
    expect(component.state).toBe('idle');
    expect(component.successMessage).toBe('Komenda wykonana pomyślnie');
    expect(component.errorMessage).toBe('Nie udało się wysłać komendy');
  });
});
