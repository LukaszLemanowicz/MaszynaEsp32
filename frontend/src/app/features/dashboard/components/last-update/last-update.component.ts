import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-last-update',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-sm" [class.text-gray-600]="!isStale" [class.text-error-600]="isStale">
      <span class="font-medium">Ostatnia aktualizacja:</span>
      <span class="ml-1">{{ getFormattedTime() }}</span>
    </div>
  `,
})
export class LastUpdateComponent implements OnChanges {
  @Input() lastUpdate: string | null = null;
  isStale = false;

  private readonly STALE_THRESHOLD = 10000; // 10 sekund

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lastUpdate']) {
      this.checkIfStale();
    }
  }

  getFormattedTime(): string {
    if (!this.lastUpdate) {
      return 'Brak danych';
    }

    const date = new Date(this.lastUpdate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);

    if (diffSeconds < 60) {
      return `${diffSeconds} sekund temu`;
    }

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return `${diffMinutes} minut temu`;
    }

    // Format: DD.MM.YYYY HH:MM:SS
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
  }

  private checkIfStale(): void {
    if (!this.lastUpdate) {
      this.isStale = true;
      return;
    }

    const date = new Date(this.lastUpdate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    this.isStale = diffMs > this.STALE_THRESHOLD;
  }
}
