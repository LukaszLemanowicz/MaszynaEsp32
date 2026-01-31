import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { DeviceStateService } from '../../core/services/device-state.service';
import { CommandService } from '../../core/services/command.service';
import { DeviceState } from '../../models/device.model';
import { DeviceStatusComponent } from './components/device-status/device-status.component';
import { TemperatureDisplayComponent } from './components/temperature-display/temperature-display.component';
import { LastUpdateComponent } from './components/last-update/last-update.component';
import { PowerControlComponent } from './components/power-control/power-control.component';
import { ServoControlComponent } from './components/servo-control/servo-control.component';
import { CommandFeedbackComponent, FeedbackState } from './components/command-feedback/command-feedback.component';
import { ErrorBannerComponent } from './components/error-banner/error-banner.component';
import { UserMenuComponent } from './components/user-menu/user-menu.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { LoadingIndicatorComponent } from '../../shared/components/loading-indicator/loading-indicator.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DeviceStatusComponent,
    TemperatureDisplayComponent,
    LastUpdateComponent,
    PowerControlComponent,
    ServoControlComponent,
    CommandFeedbackComponent,
    ErrorBannerComponent,
    UserMenuComponent,
    CardComponent,
    LoadingIndicatorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
            <app-user-menu></app-user-menu>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <app-error-banner
          *ngIf="errorBannerMessage"
          [message]="errorBannerMessage"
          (dismissed)="errorBannerMessage = ''"
        ></app-error-banner>

        <!-- Status Section -->
        <div class="mb-6">
          <app-card>
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-lg font-semibold text-gray-900 mb-2">Status urządzenia</h2>
                <app-device-status [status]="getDeviceStatus()"></app-device-status>
              </div>
              <app-last-update [lastUpdate]="deviceState?.lastUpdate || null"></app-last-update>
            </div>
          </app-card>
        </div>

        <!-- Temperatures Section -->
        <div class="mb-6">
          <app-card title="Temperatury">
            <app-temperature-display
              *ngIf="deviceState"
              [temperature1]="deviceState.temperature1"
              [temperature2]="deviceState.temperature2"
              [temperature3]="deviceState.temperature3"
            ></app-temperature-display>
            <div
              *ngIf="!deviceState && !loading"
              class="text-center py-8 text-gray-500"
            >
              Brak danych z urządzenia
            </div>
            <div *ngIf="loading && !deviceState" class="text-center py-8">
              <app-loading-indicator text="Ładowanie danych..."></app-loading-indicator>
            </div>
          </app-card>
        </div>

        <!-- Controls Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Power Control -->
          <app-card>
            <app-power-control
              [isOn]="powerState"
              [disabled]="isDeviceOffline()"
              [loading]="powerLoading"
              (toggle)="onPowerToggle($event)"
            ></app-power-control>
            <div class="mt-4">
              <app-command-feedback
                [state]="powerFeedbackState"
                [successMessage]="'Komenda wykonana pomyślnie'"
                [errorMessage]="powerErrorMessage"
              ></app-command-feedback>
            </div>
          </app-card>

          <!-- Servo Control -->
          <app-card>
            <app-servo-control
              [disabled]="isDeviceOffline()"
              [loading]="servoLoading"
              (valueChange)="onServoValueChange($event)"
            ></app-servo-control>
            <div class="mt-4">
              <app-command-feedback
                [state]="servoFeedbackState"
                [successMessage]="'Komenda serwa wykonana pomyślnie'"
                [errorMessage]="servoErrorMessage"
              ></app-command-feedback>
            </div>
          </app-card>
        </div>
      </main>
    </div>
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  deviceState: DeviceState | null = null;
  loading = true;
  errorBannerMessage = '';

  // Power control state
  powerState = false;
  powerLoading = false;
  powerFeedbackState: FeedbackState = 'idle';
  powerErrorMessage = '';

  // Servo control state
  servoLoading = false;
  servoFeedbackState: FeedbackState = 'idle';
  servoErrorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private deviceStateService: DeviceStateService,
    private commandService: CommandService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Rozpocznij polling danych
    this.deviceStateService.startPolling();

    // Subskrybuj zmiany stanu urządzenia
    this.deviceStateService
      .getDeviceStateObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (state) => {
          this.deviceState = state;
          this.loading = false;
          this.cdr.markForCheck(); // Wymuś aktualizację widoku przy OnPush
        },
        error: (error) => {
          console.error('Błąd pobierania stanu urządzenia:', error);
          this.errorBannerMessage = 'Błąd połączenia z serwerem. Sprawdź połączenie internetowe.';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });

    // Pobierz początkowy stan
    this.deviceStateService
      .getDeviceState()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (state) => {
          this.deviceState = state;
          this.loading = false;
          this.cdr.markForCheck(); // Wymuś aktualizację widoku przy OnPush
        },
        error: (error) => {
          console.error('Błąd pobierania początkowego stanu:', error);
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.deviceStateService.stopPolling();
  }

  getDeviceStatus(): 'online' | 'offline' | 'loading' {
    if (this.loading) {
      return 'loading';
    }
    return this.deviceState?.status || 'offline';
  }

  isDeviceOffline(): boolean {
    return this.deviceState?.status === 'offline';
  }

  onPowerToggle(isOn: boolean): void {
    if (this.isDeviceOffline() || this.powerLoading) {
      return;
    }

    this.powerLoading = true;
    this.powerFeedbackState = 'sending';
    this.powerErrorMessage = '';

    const commandType = isOn ? 'power_on' : 'power_off';

    this.commandService
      .sendCommandAndWaitForAck(commandType)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (command) => {
          this.powerLoading = false;
          if (command && command.acknowledged) {
            this.powerState = isOn;
            this.powerFeedbackState = 'success';
            this.cdr.markForCheck();
            // Reset feedback state po 5 sekundach
            setTimeout(() => {
              this.powerFeedbackState = 'idle';
              this.cdr.markForCheck();
            }, 5000);
          } else {
            this.powerFeedbackState = 'error';
            this.powerErrorMessage = 'Komenda nie została wykonana w oczekiwanym czasie.';
            this.cdr.markForCheck();
          }
        },
        error: (error) => {
          this.powerLoading = false;
          this.powerFeedbackState = 'error';
          if (error.message) {
            this.powerErrorMessage = error.message;
          } else if (error.status === 400) {
            this.powerErrorMessage = 'Urządzenie jest offline. Nie można wysłać komendy.';
          } else {
            this.powerErrorMessage = 'Nie udało się wysłać komendy. Spróbuj ponownie.';
          }
          this.cdr.markForCheck();
        },
      });
  }

  onServoValueChange(value: number): void {
    if (this.isDeviceOffline() || this.servoLoading) {
      return;
    }

    this.servoLoading = true;
    this.servoFeedbackState = 'sending';
    this.servoErrorMessage = '';

    this.commandService
      .sendCommandAndWaitForAck('servo', value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (command) => {
          this.servoLoading = false;
          if (command && command.acknowledged) {
            this.servoFeedbackState = 'success';
            this.cdr.markForCheck();
            // Reset feedback state po 5 sekundach
            setTimeout(() => {
              this.servoFeedbackState = 'idle';
              this.cdr.markForCheck();
            }, 5000);
          } else {
            this.servoFeedbackState = 'error';
            this.servoErrorMessage = 'Komenda nie została wykonana w oczekiwanym czasie.';
            this.cdr.markForCheck();
          }
        },
        error: (error) => {
          this.servoLoading = false;
          this.servoFeedbackState = 'error';
          if (error.message) {
            this.servoErrorMessage = error.message;
          } else if (error.status === 400) {
            this.servoErrorMessage = 'Nieprawidłowa wartość lub urządzenie jest offline.';
          } else {
            this.servoErrorMessage = 'Nie udało się wysłać komendy. Spróbuj ponownie.';
          }
          this.cdr.markForCheck();
        },
      });
  }
}
