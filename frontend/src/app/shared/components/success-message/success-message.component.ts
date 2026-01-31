import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { timer, Subscription } from 'rxjs';

@Component({
  selector: 'app-success-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="message && show"
      class="rounded-md bg-success-50 p-4 border border-success-200"
      role="alert"
      [attr.aria-live]="'polite'"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-success-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 *ngIf="title" class="text-sm font-medium text-success-800">{{ title }}</h3>
          <div [class.mt-2]="title" class="text-sm text-success-700">
            <p>{{ message }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SuccessMessageComponent implements OnInit, OnDestroy {
  @Input() message = '';
  @Input() title = '';
  @Input() autoHide = true;
  @Input() hideDelay = 5000; // 5 sekund

  show = true;
  private subscription?: Subscription;

  ngOnInit(): void {
    if (this.autoHide && this.message) {
      this.subscription = timer(this.hideDelay).subscribe(() => {
        this.show = false;
      });
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
