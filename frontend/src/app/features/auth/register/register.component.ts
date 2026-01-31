import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { SuccessMessageComponent } from '../../../shared/components/success-message/success-message.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    InputComponent,
    ErrorMessageComponent,
    SuccessMessageComponent,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Utwórz nowe konto
          </h2>
        </div>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <app-error-message
            *ngIf="errorMessage"
            [message]="errorMessage"
            [dismissible]="true"
            (dismiss)="errorMessage = ''"
          ></app-error-message>

          <app-success-message
            *ngIf="successMessage"
            [message]="successMessage"
            [autoHide]="false"
          ></app-success-message>

          <div class="space-y-4">
            <app-input
              id="username"
              label="Nazwa użytkownika"
              type="text"
              formControlName="username"
              [required]="true"
              [errorMessage]="getFieldError('username')"
              [disabled]="loading"
              hint="Maksymalnie 50 znaków"
            ></app-input>

            <app-input
              id="password"
              label="Hasło"
              type="password"
              formControlName="password"
              [required]="true"
              [errorMessage]="getFieldError('password')"
              [disabled]="loading"
              hint="Minimum 8 znaków"
            ></app-input>

            <app-input
              id="deviceId"
              label="ID urządzenia"
              type="text"
              formControlName="deviceId"
              [required]="true"
              [errorMessage]="getFieldError('deviceId')"
              [disabled]="loading"
              hint="ID urządzenia ESP32 (np. ESP32_001)"
            ></app-input>
          </div>

          <div>
            <app-button
              type="submit"
              variant="primary"
              [loading]="loading"
              [disabled]="registerForm.invalid"
              [fullWidth]="true"
            >
              Zarejestruj się
            </app-button>
          </div>

          <div class="text-center">
            <a
              routerLink="/login"
              class="text-sm text-primary-600 hover:text-primary-500"
            >
              Masz już konto? Zaloguj się
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private errorHandler: ErrorHandlerService
  ) {
    this.registerForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
        ],
      ],
      deviceId: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
        ],
      ],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const registerData = {
      username: this.registerForm.value.username,
      password: this.registerForm.value.password,
      deviceId: this.registerForm.value.deviceId,
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Rejestracja zakończona sukcesem. Zaloguj się.';
        // Przekierowanie do logowania po 2 sekundach
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: { registered: 'true' },
          });
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 409) {
          this.errorMessage = 'Użytkownik o podanej nazwie już istnieje.';
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.';
        }
      },
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return 'To pole jest wymagane';
      }
      if (field.errors?.['minlength']) {
        return `Minimum ${field.errors['minlength'].requiredLength} znaków`;
      }
      if (field.errors?.['maxlength']) {
        return `Maksymalnie ${field.errors['maxlength'].requiredLength} znaków`;
      }
    }
    return '';
  }
}
