import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuccessMessageComponent } from '../../../../shared/components/success-message/success-message.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';

export type FeedbackState = 'idle' | 'sending' | 'success' | 'error';

@Component({
  selector: 'app-command-feedback',
  standalone: true,
  imports: [CommonModule, SuccessMessageComponent, ErrorMessageComponent, LoadingIndicatorComponent],
  template: `
    <div class="space-y-2">
      <app-loading-indicator
        *ngIf="state === 'sending'"
        text="Wysyłanie komendy..."
        size="small"
      ></app-loading-indicator>

      <app-success-message
        *ngIf="state === 'success'"
        [message]="successMessage"
        [autoHide]="true"
        [hideDelay]="5000"
      ></app-success-message>

      <app-error-message
        *ngIf="state === 'error'"
        [message]="errorMessage"
        [dismissible]="true"
      ></app-error-message>
    </div>
  `,
})
export class CommandFeedbackComponent {
  @Input() state: FeedbackState = 'idle';
  @Input() successMessage = 'Komenda wykonana pomyślnie';
  @Input() errorMessage = 'Nie udało się wysłać komendy';
}
