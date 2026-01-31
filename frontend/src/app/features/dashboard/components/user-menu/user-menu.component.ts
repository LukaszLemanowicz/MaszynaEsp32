import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="flex items-center space-x-4">
      <span *ngIf="username" class="text-sm text-gray-700">
        {{ username }}
      </span>
      <app-button variant="secondary" (clicked)="onLogout()" type="button">
        Wyloguj
      </app-button>
    </div>
  `,
})
export class UserMenuComponent {
  username: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    const user = this.authService.getCurrentUserSync();
    this.username = user?.username || null;

    // Subskrypcja zmian użytkownika
    this.authService.currentUser$.subscribe((user) => {
      this.username = user?.username || null;
    });
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Nawet jeśli logout się nie powiódł, przekieruj do logowania
        this.router.navigate(['/login']);
      },
    });
  }
}
