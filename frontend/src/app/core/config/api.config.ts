export const API_CONFIG = {
  baseUrl: 'http://localhost:3000/api',
  pollingInterval: 5000, // 5 sekund
  commandStatusPollingInterval: 1000, // 1 sekunda
  commandStatusMaxAttempts: 5, // maksymalnie 5 prób (5 sekund)
} as const;
