import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-temperature-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        *ngFor="let temp of temperatures; let i = index"
        class="bg-white rounded-lg shadow-md p-6 text-center"
      >
        <div class="flex items-center justify-center mb-2">
          <svg
            class="h-8 w-8 text-primary-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 class="text-sm font-medium text-gray-600 mb-2">Temperatura {{ i + 1 }}</h3>
        <div class="text-3xl font-bold" [class.text-gray-900]="temp !== null"
          [class.text-gray-400]="temp === null">
          {{ getTemperatureDisplay(temp) }}
        </div>
      </div>
    </div>
  `,
})
export class TemperatureDisplayComponent {
  @Input() temperature1: number | null = null;
  @Input() temperature2: number | null = null;
  @Input() temperature3: number | null = null;

  get temperatures(): (number | null)[] {
    return [this.temperature1, this.temperature2, this.temperature3];
  }

  getTemperatureDisplay(temp: number | null): string {
    if (temp === null) {
      return 'N/A';
    }
    if (temp === -999.0) {
      return 'Błąd';
    }
    return `${temp.toFixed(1)}°C`;
  }
}
