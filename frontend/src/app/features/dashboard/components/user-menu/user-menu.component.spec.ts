import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { UserMenuComponent } from './user-menu.component';
import { AuthService } from '../../../../core/services/auth.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('UserMenuComponent', () => {
  let component: UserMenuComponent;
  let fixture: ComponentFixture<UserMenuComponent>;
  let authService: any;
  let router: any;

  beforeEach(async () => {
    const authServiceSpy = {
      getCurrentUserSync: vi.fn(() => ({ username: 'testuser' })),
      currentUser$: of({ username: 'testuser' }),
      logout: vi.fn(() => of({})),
    };

    const routerSpy = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [UserMenuComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserMenuComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('powinien utworzyć komponent', () => {
    expect(component).toBeTruthy();
  });

  it('powinien wywołać logout i przekierować do logowania', () => {
    authService.logout.mockReturnValue(of({}));

    component.onLogout();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
