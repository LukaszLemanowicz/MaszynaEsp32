import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';

@Component({
  selector: 'app-servo-control',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900">Sterowanie serwem</h3>
      <form [formGroup]="servoForm" (ngSubmit)="onSubmit()">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Wartość serwa: {{ servoForm.value.value || 0 }}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              formControlName="value"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              [class.slider-primary]="!disabled && !loading"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <app-input
              id="servo-value-input"
              label="Wartość (0-100)"
              type="number"
              formControlName="value"
              [errorMessage]="getFieldError('value')"
              [disabled]="disabled || loading"
            ></app-input>
          </div>

          <app-button
            type="submit"
            variant="primary"
            [loading]="loading"
            [disabled]="servoForm.invalid || disabled"
            [fullWidth]="true"
          >
            Ustaw serwo
          </app-button>
        </div>
      </form>
      <p *ngIf="disabled" class="text-sm text-error-600">
        Urządzenie offline - sterowanie niedostępne
      </p>
    </div>
  `,
  styles: [
    `
      .slider-primary::-webkit-slider-thumb {
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #0ea5e9;
        cursor: pointer;
      }
      .slider-primary::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #0ea5e9;
        cursor: pointer;
        border: none;
      }
    `,
  ],
})
export class ServoControlComponent implements OnChanges {
  @Input() disabled = false;
  @Input() loading = false;
  @Output() valueChange = new EventEmitter<number>();

  servoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.servoForm = this.fb.group({
      value: [
        0,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(100),
        ],
      ],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Aktualizuj stan disabled kontrolki formularza zamiast używać atrybutu [disabled]
    if (changes['disabled'] || changes['loading']) {
      const shouldDisable = this.disabled || this.loading;
      const valueControl = this.servoForm.get('value');
      if (valueControl) {
        if (shouldDisable) {
          valueControl.disable();
        } else {
          valueControl.enable();
        }
      }
    }
  }

  onSubmit(): void {
    if (this.servoForm.invalid || this.disabled || this.loading) {
      return;
    }

    const value = this.servoForm.value.value;
    this.valueChange.emit(value);
  }

  getFieldError(fieldName: string): string {
    const field = this.servoForm.get(fieldName);
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return 'To pole jest wymagane';
      }
      if (field.errors?.['min']) {
        return 'Wartość musi być większa lub równa 0';
      }
      if (field.errors?.['max']) {
        return 'Wartość musi być mniejsza lub równa 100';
      }
    }
    return '';
  }
}
