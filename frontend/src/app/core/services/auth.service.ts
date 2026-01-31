import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RegisterResponse,
} from '../../models/user.model';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'current_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Logowanie użytkownika
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_CONFIG.baseUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        this.setToken(response.token);
        this.setUser(response.user);
        this.isAuthenticatedSubject.next(true);
        this.currentUserSubject.next(response.user);
      }),
      catchError((error) => {
        console.error('Błąd logowania:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Rejestracja nowego użytkownika
   */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http
      .post<RegisterResponse>(`${API_CONFIG.baseUrl}/auth/register`, data)
      .pipe(
        catchError((error) => {
          console.error('Błąd rejestracji:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Wylogowanie użytkownika
   */
  logout(): Observable<void> {
    const token = this.getToken();
    if (token) {
      return this.http.post<void>(`${API_CONFIG.baseUrl}/auth/logout`, {}).pipe(
        tap(() => {
          this.clearAuth();
        }),
        catchError((error) => {
          // Nawet jeśli backend zwróci błąd, czyścimy lokalne dane
          this.clearAuth();
          return throwError(() => error);
        })
      );
    }
    this.clearAuth();
    return of(undefined);
  }

  /**
   * Pobranie aktualnego użytkownika
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${API_CONFIG.baseUrl}/auth/me`).pipe(
      tap((user) => {
        this.setUser(user);
        this.currentUserSubject.next(user);
      }),
      catchError((error) => {
        // Jeśli token jest nieprawidłowy, wyloguj użytkownika
        if (error.status === 401) {
          this.clearAuth();
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Sprawdzenie czy użytkownik jest zalogowany
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Pobranie tokenu
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Pobranie aktualnego użytkownika (synchronicznie)
   */
  getCurrentUserSync(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Ustawienie tokenu
   */
  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Ustawienie użytkownika
   */
  private setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /**
   * Pobranie zapisanego użytkownika
   */
  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Sprawdzenie czy istnieje ważny token
   */
  private hasValidToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Wyczyszczenie danych autoryzacji
   */
  private clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
  }
}
