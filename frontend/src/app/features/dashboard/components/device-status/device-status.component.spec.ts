import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeviceStatusComponent } from './device-status.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('DeviceStatusComponent', () => {
  let component: DeviceStatusComponent;
  let fixture: ComponentFixture<DeviceStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceStatusComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeviceStatusComponent);
    component = fixture.componentInstance;
  });

  it('powinien utworzyć komponent', () => {
    expect(component).toBeTruthy();
  });

  it('powinien zwrócić "Online" dla statusu online', () => {
    component.status = 'online';
    expect(component.getStatusText()).toBe('Online');
  });

  it('powinien zwrócić "Offline" dla statusu offline', () => {
    component.status = 'offline';
    expect(component.getStatusText()).toBe('Offline');
  });

  it('powinien zwrócić "Sprawdzanie połączenia..." dla statusu loading', () => {
    component.status = 'loading';
    expect(component.getStatusText()).toBe('Sprawdzanie połączenia...');
  });
});
