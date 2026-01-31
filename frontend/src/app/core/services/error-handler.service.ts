import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface ErrorMessage {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  /**
   * Obsługa błędu HTTP i zwrócenie czytelnego komunikatu
   */
  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage: ErrorMessage;

    if (error.error instanceof ErrorEvent) {
      // Błąd po stronie klienta
      errorMessage = {
        title: 'Błąd sieci',
        message: 'Wystąpił problem z połączeniem. Sprawdź połączenie internetowe.',
        type: 'error',
      };
    } else {
      // Błąd po stronie serwera
      switch (error.status) {
        case 400:
          errorMessage = {
            title: 'Błąd walidacji',
            message: error.error?.message || 'Nieprawidłowe dane. Sprawdź wprowadzone wartości.',
            type: 'error',
          };
          break;
        case 401:
          errorMessage = {
            title: 'Brak autoryzacji',
            message: 'Sesja wygasła. Zaloguj się ponownie.',
            type: 'error',
          };
          break;
        case 403:
          errorMessage = {
            title: 'Brak uprawnień',
            message: 'Nie masz uprawnień do wykonania tej operacji.',
            type: 'error',
          };
          break;
        case 404:
          errorMessage = {
            title: 'Nie znaleziono',
            message: error.error?.message || 'Żądany zasób nie został znaleziony.',
            type: 'error',
          };
          break;
        case 409:
          errorMessage = {
            title: 'Konflikt',
            message: error.error?.message || 'Użytkownik o podanej nazwie już istnieje.',
            type: 'error',
          };
          break;
        case 500:
          errorMessage = {
            title: 'Błąd serwera',
            message: 'Wystąpił błąd po stronie serwera. Spróbuj ponownie później.',
            type: 'error',
          };
          break;
        default:
          errorMessage = {
            title: 'Błąd',
            message: error.error?.message || 'Wystąpił nieoczekiwany błąd.',
            type: 'error',
          };
      }
    }

    console.error('Błąd HTTP:', errorMessage, error);
    return throwError(() => errorMessage);
  }

  /**
   * Obsługa błędu 401 (wygasła sesja)
   */
  handle401(): void {
    // Ta metoda może być wywoływana przez interceptor
    // Przekierowanie do logowania jest obsługiwane przez interceptor
  }

  /**
   * Pobranie komunikatu błędu z odpowiedzi HTTP
   */
  getErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'Wystąpił nieoczekiwany błąd.';
  }
}
