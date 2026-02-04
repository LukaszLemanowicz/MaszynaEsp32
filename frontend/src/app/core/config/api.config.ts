import { environment } from '../../../environments/environment';

export const API_CONFIG = {
  baseUrl: environment.apiUrl,
  pollingInterval: 5000, // 5 sekund
  commandStatusPollingInterval: 1000, // 1 sekunda
  commandStatusMaxAttempts: 5, // maksymalnie 5 prób (5 sekund)
} as const;
