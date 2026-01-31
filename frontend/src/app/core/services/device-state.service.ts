import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, BehaviorSubject, of, throwError } from 'rxjs';
import { switchMap, catchError, startWith, tap } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';
import { DeviceState } from '../../models/device.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class DeviceStateService {
  private deviceStateSubject = new BehaviorSubject<DeviceState | null>(null);
  public deviceState$ = this.deviceStateSubject.asObservable();

  private pollingSubscription: any = null;
  private isPolling = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Pobranie aktualnego stanu urządzenia (jednorazowe)
   */
  getDeviceState(): Observable<DeviceState> {
    return this.http.get<DeviceState>(`${API_CONFIG.baseUrl}/device-state`).pipe(
      tap((state) => {
        this.deviceStateSubject.next(state);
      }),
      catchError((error) => {
        console.error('Błąd pobierania stanu urządzenia:', error);
        // Jeśli urządzenie nie istnieje, zwróć stan offline
        if (error.status === 404) {
          const offlineState: DeviceState = {
            deviceId: '',
            temperature1: null,
            temperature2: null,
            temperature3: null,
            status: 'offline',
            lastUpdate: null,
          };
          this.deviceStateSubject.next(offlineState);
          return of(offlineState);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Rozpoczęcie polling danych co 5 sekund
   */
  startPolling(intervalMs: number = API_CONFIG.pollingInterval): void {
    if (this.isPolling) {
      return; // Już działa polling
    }

    this.isPolling = true;

    // Rozpocznij polling tylko jeśli użytkownik jest zalogowany
    if (!this.authService.isAuthenticated()) {
      this.isPolling = false;
      return;
    }

    this.pollingSubscription = interval(intervalMs)
      .pipe(
        startWith(0), // Natychmiastowe pierwsze wywołanie
        switchMap(() => this.getDeviceState()),
        catchError((error) => {
          console.error('Błąd podczas polling:', error);
          // Kontynuuj polling nawet przy błędzie
          return of(null);
        })
      )
      .subscribe({
        next: (state) => {
          if (state) {
            this.deviceStateSubject.next(state);
          }
        },
        error: (error) => {
          console.error('Błąd subskrypcji polling:', error);
        },
      });
  }

  /**
   * Zatrzymanie polling
   */
  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
      this.isPolling = false;
    }
  }

  /**
   * Pobranie aktualnego stanu (synchronicznie)
   */
  getDeviceStateSync(): DeviceState | null {
    return this.deviceStateSubject.value;
  }

  /**
   * Observable dla subskrypcji zmian stanu
   */
  getDeviceStateObservable(): Observable<DeviceState | null> {
    return this.deviceState$;
  }
}
