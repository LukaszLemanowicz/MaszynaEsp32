import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="text-center">
        <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Strona nie została znaleziona</h2>
        <p class="text-gray-600 mb-8">Przepraszamy, strona której szukasz nie istnieje.</p>
        <div class="space-x-4">
          <app-button variant="primary" (clicked)="goToDashboard()">
            Przejdź do Dashboard
          </app-button>
          <app-button variant="secondary" (clicked)="goToLogin()">
            Przejdź do logowania
          </app-button>
        </div>
      </div>
    </div>
  `,
})
export class NotFoundComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  goToDashboard(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
