import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';

@Component({
  selector: 'app-power-control',
  standalone: true,
  imports: [CommonModule, LoadingIndicatorComponent],
  template: `
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900">Sterowanie maszyną</h3>
      <div class="flex items-center space-x-4">
        <label class="flex items-center cursor-pointer">
          <input
            type="checkbox"
            [checked]="isOn"
            [disabled]="disabled || loading"
            (change)="onToggle()"
            class="sr-only"
            [attr.aria-label]="isOn ? 'Wyłącz maszynę' : 'Włącz maszynę'"
          />
          <div
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            [class.bg-primary-600]="isOn && !disabled"
            [class.bg-gray-300]="!isOn || disabled"
            [class.cursor-pointer]="!disabled && !loading"
            [class.cursor-not-allowed]="disabled || loading"
            (click)="!disabled && !loading && onToggle()"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              [class.translate-x-6]="isOn"
              [class.translate-x-1]="!isOn"
            ></span>
          </div>
          <span class="text-sm font-medium text-gray-700">
            {{ isOn ? 'WŁ' : 'WYŁ' }}
          </span>
        </label>
        <app-loading-indicator *ngIf="loading" size="small" text="Wysyłanie..."></app-loading-indicator>
      </div>
      <p *ngIf="disabled" class="text-sm text-error-600">
        Urządzenie offline - sterowanie niedostępne
      </p>
    </div>
  `,
})
export class PowerControlComponent {
  @Input() isOn = false;
  @Input() disabled = false;
  @Input() loading = false;
  @Output() toggle = new EventEmitter<boolean>();

  onToggle(): void {
    if (!this.disabled && !this.loading) {
      this.toggle.emit(!this.isOn);
    }
  }
}
