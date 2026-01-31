import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="message"
      class="rounded-md bg-error-50 p-4 border border-error-200"
      role="alert"
      [attr.aria-live]="ariaLive"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-error-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 *ngIf="title" class="text-sm font-medium text-error-800">{{ title }}</h3>
          <div [class.mt-2]="title" class="text-sm text-error-700">
            <p>{{ message }}</p>
          </div>
        </div>
        <div class="ml-auto pl-3" *ngIf="dismissible">
          <button
            type="button"
            class="inline-flex rounded-md bg-error-50 text-error-400 hover:bg-error-100 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2"
            (click)="dismiss()"
            aria-label="Zamknij"
          >
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ErrorMessageComponent {
  @Input() message = '';
  @Input() title = '';
  @Input() dismissible = false;
  @Input() ariaLive: 'polite' | 'assertive' = 'assertive';

  dismiss(): void {
    this.message = '';
    this.title = '';
  }
}
