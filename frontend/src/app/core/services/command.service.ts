import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, throwError, of } from 'rxjs';
import { switchMap, take, catchError, map } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';
import {
  Command,
  CommandResponse,
  ServoCommandRequest,
  CommandType,
} from '../../models/command.model';

@Injectable({
  providedIn: 'root',
})
export class CommandService {
  constructor(private http: HttpClient) {}

  /**
   * Wysłanie komendy włączenia maszyny
   */
  sendPowerOn(): Observable<CommandResponse> {
    return this.http.post<CommandResponse>(`${API_CONFIG.baseUrl}/commands/power-on`, {}).pipe(
      catchError((error) => {
        console.error('Błąd wysyłania komendy power-on:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Wysłanie komendy wyłączenia maszyny
   */
  sendPowerOff(): Observable<CommandResponse> {
    return this.http.post<CommandResponse>(`${API_CONFIG.baseUrl}/commands/power-off`, {}).pipe(
      catchError((error) => {
        console.error('Błąd wysyłania komendy power-off:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Wysłanie komendy ustawienia serwa
   */
  sendServoCommand(value: number): Observable<CommandResponse> {
    // Walidacja wartości
    if (value < 0 || value > 100) {
      return throwError(() => new Error('Wartość serwa musi być w zakresie 0-100'));
    }

    const request: ServoCommandRequest = { value };
    return this.http
      .post<CommandResponse>(`${API_CONFIG.baseUrl}/commands/servo`, request)
      .pipe(
        catchError((error) => {
          console.error('Błąd wysyłania komendy servo:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Sprawdzenie statusu komendy
   */
  getCommandStatus(commandId: number): Observable<Command> {
    return this.http.get<Command>(`${API_CONFIG.baseUrl}/commands/status/${commandId}`).pipe(
      catchError((error) => {
        console.error('Błąd sprawdzania statusu komendy:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Polling statusu komendy z timeout
   * Zwraca Observable, który emituje Command gdy komenda zostanie potwierdzona
   * lub null jeśli timeout
   */
  pollCommandStatus(
    commandId: number,
    maxAttempts: number = API_CONFIG.commandStatusMaxAttempts
  ): Observable<Command | null> {
    return interval(API_CONFIG.commandStatusPollingInterval).pipe(
      switchMap(() => this.getCommandStatus(commandId)),
      map((command) => {
        if (command.acknowledged) {
          return command;
        }
        return null;
      }),
      take(maxAttempts),
      catchError((error) => {
        console.error('Błąd podczas polling statusu komendy:', error);
        return of(null);
      })
    );
  }

  /**
   * Wysłanie komendy i oczekiwanie na potwierdzenie
   * Zwraca Observable, który emituje Command gdy komenda zostanie potwierdzona
   */
  sendCommandAndWaitForAck(
    commandType: 'power_on' | 'power_off' | 'servo',
    value?: number
  ): Observable<Command | null> {
    let commandObservable: Observable<CommandResponse>;

    switch (commandType) {
      case 'power_on':
        commandObservable = this.sendPowerOn();
        break;
      case 'power_off':
        commandObservable = this.sendPowerOff();
        break;
      case 'servo':
        if (value === undefined) {
          return throwError(() => new Error('Wartość serwa jest wymagana'));
        }
        commandObservable = this.sendServoCommand(value);
        break;
      default:
        return throwError(() => new Error('Nieznany typ komendy'));
    }

    return commandObservable.pipe(
      switchMap((response) => {
        // Rozpocznij polling statusu komendy
        return this.pollCommandStatus(response.command.id).pipe(
          map((command) => {
            if (command && command.acknowledged) {
              return command;
            }
            return null; // Timeout
          })
        );
      }),
      catchError((error) => {
        console.error('Błąd podczas oczekiwania na potwierdzenie:', error);
        return of(null);
      })
    );
  }
}
