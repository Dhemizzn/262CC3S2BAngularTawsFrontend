import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

export interface Toast {
  message: string;
  type: ToastType;
  delay?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'info') {
    const toast: Toast = {
      message,
      type,
      delay: 3000
    };

    this.toasts.update(actuales => [...actuales, toast]);

    setTimeout(() => {
      this.remove(toast);
    }, toast.delay);
  }

  remove(toast: Toast) {
    this.toasts.update(actuales => actuales.filter((t) => t !== toast));
  }

  clear() {
    this.toasts.set([]);
  }
}