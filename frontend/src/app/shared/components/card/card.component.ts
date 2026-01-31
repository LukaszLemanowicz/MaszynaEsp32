import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getCardClasses()">
      <h3 *ngIf="title" class="text-lg font-semibold text-gray-900 mb-4">
        {{ title }}
      </h3>
      <ng-content></ng-content>
    </div>
  `,
})
export class CardComponent {
  @Input() title = '';
  @Input() variant: 'default' | 'highlighted' | 'bordered' = 'default';

  getCardClasses(): string {
    const baseClasses = 'rounded-lg p-6';
    const variantClasses = {
      default: 'bg-white shadow-md',
      highlighted: 'bg-primary-50 border-2 border-primary-200 shadow-md',
      bordered: 'bg-white border border-gray-200',
    };
    return `${baseClasses} ${variantClasses[this.variant]}`;
  }
}
