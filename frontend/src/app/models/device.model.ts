export interface DeviceState {
  deviceId: string;
  temperature1: number | null;
  temperature2: number | null;
  temperature3: number | null;
  status: 'online' | 'offline';
  lastUpdate: string | null;
}
