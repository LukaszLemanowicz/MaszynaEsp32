import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Pobierz token
  const token = authService.getToken();

  // Dodaj token do nagłówka jeśli istnieje
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Obsłuż odpowiedź
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Jeśli błąd 401 (Unauthorized), wyloguj użytkownika i przekieruj do logowania
      if (error.status === 401) {
        authService.logout().subscribe({
          next: () => {
            router.navigate(['/login'], {
              queryParams: { returnUrl: router.url },
            });
          },
          error: () => {
            // Nawet jeśli logout się nie powiódł, przekieruj do logowania
            router.navigate(['/login'], {
              queryParams: { returnUrl: router.url },
            });
          },
        });
      }

      return throwError(() => error);
    })
  );
};
