import { Component, inject } from '@angular/core';
import { ToastService, ToastType } from '../../services/toast';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  templateUrl: './toast-container.html',
  host: { 
    'class': 'position-fixed top-50 start-50 translate-middle', 
    'style': 'z-index: 9999; pointer-events: none;' 
  }
})
export class ToastContainer {
  toastService = inject(ToastService);

  getToastClass(type: ToastType): string {
    const baseClass = 'text-light';
    switch (type) {
      case 'success': return `bg-success ${baseClass}`;
      case 'danger': return `bg-danger ${baseClass}`;
      case 'warning': return `bg-warning text-dark`;
      case 'info': return `bg-info ${baseClass}`;
      default: return baseClass;
    }
  }
}