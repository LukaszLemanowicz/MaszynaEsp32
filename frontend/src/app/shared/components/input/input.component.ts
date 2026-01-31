import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="w-full">
      <label
        *ngIf="label"
        [for]="id"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        {{ label }}
        <span *ngIf="required" class="text-error-500">*</span>
      </label>
      <input
        [id]="id"
        [type]="type"
        [value]="value"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [required]="required"
        [class]="getInputClasses()"
        [attr.aria-invalid]="hasError"
        [attr.aria-describedby]="hasError ? id + '-error' : null"
        (input)="onInput($event)"
        (blur)="onBlur()"
      />
      <p
        *ngIf="errorMessage"
        [id]="id + '-error'"
        class="mt-1 text-sm text-error-600"
        role="alert"
      >
        {{ errorMessage }}
      </p>
      <p *ngIf="hint && !errorMessage" class="mt-1 text-sm text-gray-500">
        {{ hint }}
      </p>
    </div>
  `,
})
export class InputComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() label = '';
  @Input() type: 'text' | 'password' | 'email' | 'number' = 'text';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() errorMessage = '';
  @Input() hint = '';

  value = '';
  private onChange = (value: string) => {};
  private onTouched = () => {};

  get hasError(): boolean {
    return !!this.errorMessage;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  getInputClasses(): string {
    const baseClasses =
      'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed';
    const errorClasses = this.hasError
      ? 'border-error-300 text-error-900 placeholder-error-300 focus:border-error-500 focus:ring-error-500'
      : '';
    return `${baseClasses} ${errorClasses}`;
  }
}
