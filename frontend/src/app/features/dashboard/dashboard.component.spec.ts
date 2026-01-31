import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, of, throwError, Subject } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DashboardComponent } from './dashboard.component';
import { DeviceStateService } from '../../core/services/device-state.service';
import { CommandService } from '../../core/services/command.service';
import { DeviceState } from '../../models/device.model';
import { Command, CommandResponse } from '../../models/command.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let deviceStateService: {
    startPolling: ReturnType<typeof vi.fn>;
    stopPolling: ReturnType<typeof vi.fn>;
    getDeviceState: ReturnType<typeof vi.fn>;
    getDeviceStateObservable: ReturnType<typeof vi.fn>;
  };
  let commandService: {
    sendCommandAndWaitForAck: ReturnType<typeof vi.fn>;
  };
  let changeDetectorRef: {
    markForCheck: ReturnType<typeof vi.fn>;
  };

  // Mock data
  const mockDeviceStateOnline: DeviceState = {
    deviceId: 'test-device-1',
    temperature1: 25.5,
    temperature2: 30.2,
    temperature3: 22.1,
    status: 'online',
    lastUpdate: '2024-01-01T12:00:00.000Z',
  };

  const mockDeviceStateOffline: DeviceState = {
    deviceId: 'test-device-1',
    temperature1: null,
    temperature2: null,
    temperature3: null,
    status: 'offline',
    lastUpdate: null,
  };

  const mockCommand: Command = {
    id: 1,
    deviceId: 'test-device-1',
    commandType: 'power_on',
    commandValue: null,
    createdAt: '2024-01-01T12:00:00.000Z',
    acknowledged: true,
    acknowledgedAt: '2024-01-01T12:00:01.000Z',
  };

  const mockCommandResponse: CommandResponse = {
    success: true,
    command: mockCommand,
    message: 'Komenda wysłana',
  };

  // Observable subjects dla mockowania
  let deviceStateSubject: BehaviorSubject<DeviceState | null>;

  beforeEach(async () => {
    deviceStateSubject = new BehaviorSubject<DeviceState | null>(null);

    // Tworzenie spy obiektów używając Vitest
    const deviceStateServiceSpy = {
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
      getDeviceState: vi.fn(() => of(mockDeviceStateOnline)),
      getDeviceStateObservable: vi.fn(() => deviceStateSubject.asObservable()),
    };

    const commandServiceSpy = {
      sendCommandAndWaitForAck: vi.fn(),
    };

    const changeDetectorRefSpy = {
      markForCheck: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: DeviceStateService, useValue: deviceStateServiceSpy },
        { provide: CommandService, useValue: commandServiceSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    deviceStateService = TestBed.inject(DeviceStateService) as any;
    commandService = TestBed.inject(CommandService) as any;
    changeDetectorRef = TestBed.inject(ChangeDetectorRef) as any;
  });

  afterEach(() => {
    // Cleanup
    deviceStateSubject.next(null);
  });

  describe('Inicjalizacja komponentu', () => {
    it('powinien utworzyć komponent', () => {
      expect(component).toBeTruthy();
    });

    it('powinien mieć domyślne wartości', () => {
      expect(component.deviceState).toBeNull();
      expect(component.loading).toBe(true);
      expect(component.errorBannerMessage).toBe('');
      expect(component.powerState).toBe(false);
      expect(component.powerLoading).toBe(false);
      expect(component.powerFeedbackState).toBe('idle');
      expect(component.servoLoading).toBe(false);
      expect(component.servoFeedbackState).toBe('idle');
    });

    it('powinien wywołać startPolling podczas ngOnInit', () => {
      component.ngOnInit();
      expect(deviceStateService.startPolling).toHaveBeenCalled();
    });

    it('powinien subskrybować getDeviceStateObservable podczas ngOnInit', () => {
      component.ngOnInit();
      expect(deviceStateService.getDeviceStateObservable).toHaveBeenCalled();
    });

    it('powinien pobrać początkowy stan podczas ngOnInit', () => {
      component.ngOnInit();
      expect(deviceStateService.getDeviceState).toHaveBeenCalled();
    });
  });


  describe('getDeviceStatus', () => {
    it('powinien zwrócić "loading" gdy loading jest true', () => {
      component.loading = true;
      expect(component.getDeviceStatus()).toBe('loading');
    });

    it('powinien zwrócić status z deviceState gdy loading jest false', () => {
      component.loading = false;
      component.deviceState = mockDeviceStateOnline;
      expect(component.getDeviceStatus()).toBe('online');
    });

    it('powinien zwrócić "offline" gdy deviceState jest null', () => {
      component.loading = false;
      component.deviceState = null;
      expect(component.getDeviceStatus()).toBe('offline');
    });

    it('powinien zwrócić "offline" gdy deviceState.status jest offline', () => {
      component.loading = false;
      component.deviceState = mockDeviceStateOffline;
      expect(component.getDeviceStatus()).toBe('offline');
    });
  });

  describe('isDeviceOffline', () => {
    it('powinien zwrócić true gdy deviceState.status jest offline', () => {
      component.deviceState = mockDeviceStateOffline;
      expect(component.isDeviceOffline()).toBe(true);
    });

    it('powinien zwrócić false gdy deviceState.status jest online', () => {
      component.deviceState = mockDeviceStateOnline;
      expect(component.isDeviceOffline()).toBe(false);
    });

    it('powinien zwrócić false gdy deviceState jest null', () => {
      component.deviceState = null;
      expect(component.isDeviceOffline()).toBe(false);
    });
  });

  describe('onPowerToggle', () => {
    beforeEach(() => {
      component.deviceState = mockDeviceStateOnline;
      component.powerLoading = false;
    });

    it('powinien zignorować wywołanie gdy urządzenie jest offline', () => {
      component.deviceState = mockDeviceStateOffline;
      component.onPowerToggle(true);

      expect(commandService.sendCommandAndWaitForAck).not.toHaveBeenCalled();
    });

    it('powinien zignorować wywołanie gdy powerLoading jest true', () => {
      component.powerLoading = true;
      component.onPowerToggle(true);

      expect(commandService.sendCommandAndWaitForAck).not.toHaveBeenCalled();
    });

    it('powinien wysłać komendę power_off gdy isOn jest false', () => {
      commandService.sendCommandAndWaitForAck.mockReturnValue(of(mockCommand));

      component.onPowerToggle(false);

      expect(commandService.sendCommandAndWaitForAck).toHaveBeenCalledWith('power_off');
    });

    it('powinien zaktualizować powerState na false gdy komenda power_off zostanie potwierdzona', async () => {
      const powerOffCommand = { ...mockCommand, commandType: 'power_off' as const };
      commandService.sendCommandAndWaitForAck.mockReturnValue(of(powerOffCommand));

      component.onPowerToggle(false);

      await new Promise((resolve) => setTimeout(resolve, 0));
      
      expect(component.powerState).toBe(false);
      expect(component.powerLoading).toBe(false);
      expect(component.powerFeedbackState).toBe('success');
    });

    it('powinien wyświetlić błąd gdy komenda zwróci null', async () => {
      commandService.sendCommandAndWaitForAck.mockReturnValue(of(null));

      component.onPowerToggle(true);

      await new Promise((resolve) => setTimeout(resolve, 0));
      
      expect(component.powerLoading).toBe(false);
      expect(component.powerFeedbackState).toBe('error');
      expect(component.powerErrorMessage).toBe('Komenda nie została wykonana w oczekiwanym czasie.');
    });

    it('powinien obsłużyć błąd z wiadomością', async () => {
      const error = { message: 'Błąd sieci' };
      commandService.sendCommandAndWaitForAck.mockReturnValue(throwError(() => error));

      component.onPowerToggle(true);

      await new Promise((resolve) => setTimeout(resolve, 0));
      
      expect(component.powerLoading).toBe(false);
      expect(component.powerFeedbackState).toBe('error');
      expect(component.powerErrorMessage).toBe('Błąd sieci');
    });

    it('powinien obsłużyć błąd bez wiadomości', async () => {
      const error = {};
      commandService.sendCommandAndWaitForAck.mockReturnValue(throwError(() => error));

      component.onPowerToggle(true);

      await new Promise((resolve) => setTimeout(resolve, 0));
      
      expect(component.powerLoading).toBe(false);
      expect(component.powerFeedbackState).toBe('error');
      expect(component.powerErrorMessage).toBe('Nie udało się wysłać komendy. Spróbuj ponownie.');
    });

  });

  describe('onServoValueChange', () => {
    beforeEach(() => {
      component.deviceState = mockDeviceStateOnline;
      component.servoLoading = false;
    });

    it('powinien zignorować wywołanie gdy urządzenie jest offline', () => {
      component.deviceState = mockDeviceStateOffline;
      component.onServoValueChange(50);

      expect(commandService.sendCommandAndWaitForAck).not.toHaveBeenCalled();
    });

    it('powinien zignorować wywołanie gdy servoLoading jest true', () => {
      component.servoLoading = true;
      component.onServoValueChange(50);

      expect(commandService.sendCommandAndWaitForAck).not.toHaveBeenCalled();
    });







  });

  describe('ngOnDestroy', () => {
    it('powinien wywołać stopPolling', () => {
      component.ngOnDestroy();
      expect(deviceStateService.stopPolling).toHaveBeenCalled();
    });

    it('powinien zakończyć subskrypcje', () => {
      component.ngOnInit();
      const destroySubject = component['destroy$'] as Subject<void>;
      const destroySpy = vi.spyOn(destroySubject, 'next');
      const completeSpy = vi.spyOn(destroySubject, 'complete');

      component.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('Integracja z widokiem', () => {
    it('powinien wyświetlić error banner gdy errorBannerMessage jest ustawiony', () => {
      component.errorBannerMessage = 'Test error message';
      fixture.detectChanges();

      const errorBanner = fixture.nativeElement.querySelector('app-error-banner');
      expect(errorBanner).toBeTruthy();
    });

    it('powinien ukryć error banner gdy errorBannerMessage jest pusty', () => {
      component.errorBannerMessage = '';
      fixture.detectChanges();

      const errorBanner = fixture.nativeElement.querySelector('app-error-banner');
      expect(errorBanner).toBeFalsy();
    });


    it('powinien wyświetlić temperature display gdy deviceState jest dostępny', () => {
      component.deviceState = mockDeviceStateOnline;
      component.loading = false;
      fixture.detectChanges();

      const temperatureDisplay = fixture.nativeElement.querySelector('app-temperature-display');
      expect(temperatureDisplay).toBeTruthy();
    });
  });
});
