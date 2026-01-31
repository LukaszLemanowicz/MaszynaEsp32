export interface User {
  id: number;
  username: string;
  deviceId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  deviceId: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  expiresAt: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}
