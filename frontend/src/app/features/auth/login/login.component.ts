import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    InputComponent,
    ErrorMessageComponent,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Zaloguj się do systemu
          </h2>
        </div>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <app-error-message
            *ngIf="errorMessage"
            [message]="errorMessage"
            [dismissible]="true"
            (dismiss)="errorMessage = ''"
          ></app-error-message>

          <div class="space-y-4">
            <app-input
              id="username"
              label="Nazwa użytkownika"
              type="text"
              formControlName="username"
              [required]="true"
              [errorMessage]="getFieldError('username')"
              [disabled]="loading"
            ></app-input>

            <app-input
              id="password"
              label="Hasło"
              type="password"
              formControlName="password"
              [required]="true"
              [errorMessage]="getFieldError('password')"
              [disabled]="loading"
            ></app-input>
          </div>

          <div>
            <app-button
              type="submit"
              variant="primary"
              [loading]="loading"
              [disabled]="loginForm.invalid"
              [fullWidth]="true"
            >
              Zaloguj się
            </app-button>
          </div>

          <div class="text-center">
            <a
              routerLink="/register"
              class="text-sm text-primary-600 hover:text-primary-500"
            >
              Nie masz konta? Zarejestruj się
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private errorHandler: ErrorHandlerService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Pobierz returnUrl z query params lub użyj domyślnej wartości
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Jeśli użytkownik jest już zalogowany, przekieruj do dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const credentials = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.loading = false;
        if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Nieprawidłowa nazwa użytkownika lub hasło.';
        }
      },
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return 'To pole jest wymagane';
      }
    }
    return '';
  }
}
