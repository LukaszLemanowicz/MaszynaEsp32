import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorBannerComponent } from './error-banner.component';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ErrorBannerComponent', () => {
  let component: ErrorBannerComponent;
  let fixture: ComponentFixture<ErrorBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorBannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorBannerComponent);
    component = fixture.componentInstance;
  });

  it('powinien utworzyć komponent', () => {
    expect(component).toBeTruthy();
  });

  it('powinien wyemitować dismissed event', () => {
    const spy = vi.fn();
    component.dismissed.subscribe(spy);
    component.message = 'Test error';

    component.onDismiss();

    expect(spy).toHaveBeenCalled();
    expect(component.message).toBe('');
  });
});
