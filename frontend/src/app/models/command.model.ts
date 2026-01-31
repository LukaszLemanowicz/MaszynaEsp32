export type CommandType = 'power_on' | 'power_off' | 'servo';

export interface Command {
  id: number;
  deviceId: string;
  commandType: CommandType;
  commandValue: number | null;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string | null;
}

export interface CommandResponse {
  success: boolean;
  command: Command;
  message: string;
}

export interface ServoCommandRequest {
  value: number;
}
