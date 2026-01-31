import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="show"
      class="flex items-center justify-center"
      [attr.aria-label]="ariaLabel"
      role="status"
    >
      <div
        class="animate-spin rounded-full border-2 border-gray-300 border-t-primary-600"
        [class.h-4]="size === 'small'"
        [class.w-4]="size === 'small'"
        [class.h-6]="size === 'medium'"
        [class.w-6]="size === 'medium'"
        [class.h-8]="size === 'large'"
        [class.w-8]="size === 'large'"
      ></div>
      <span *ngIf="text" class="ml-2 text-sm text-gray-600">{{ text }}</span>
    </div>
  `,
})
export class LoadingIndicatorComponent {
  @Input() show = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() text = '';
  @Input() ariaLabel = 'Ładowanie...';
}
