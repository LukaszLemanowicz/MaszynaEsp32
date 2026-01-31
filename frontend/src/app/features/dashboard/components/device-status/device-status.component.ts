import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-device-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center space-x-2">
      <div
        class="h-3 w-3 rounded-full"
        [class.bg-success-500]="status === 'online'"
        [class.bg-error-500]="status === 'offline'"
        [class.bg-gray-400]="status === 'loading'"
        [class.animate-pulse]="status === 'loading'"
        aria-hidden="true"
      ></div>
      <span class="text-sm font-medium" [class.text-success-700]="status === 'online'"
        [class.text-error-700]="status === 'offline'" [class.text-gray-600]="status === 'loading'">
        {{ getStatusText() }}
      </span>
    </div>
  `,
})
export class DeviceStatusComponent {
  @Input() status: 'online' | 'offline' | 'loading' = 'loading';

  getStatusText(): string {
    switch (this.status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'loading':
        return 'Sprawdzanie połączenia...';
      default:
        return 'Nieznany';
    }
  }
}
