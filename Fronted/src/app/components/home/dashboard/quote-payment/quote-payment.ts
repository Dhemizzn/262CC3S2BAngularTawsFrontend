import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { finalize } from 'rxjs';
import { QuoteService } from '../../../../services/quote';

@Component({
  selector: 'app-quote-payment',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './quote-payment.html',
  styleUrl: './quote-payment.scss'
})
export class QuotePayment {

  quoteService = inject(QuoteService);

  loading = signal(false);
  verifying = signal(false);
  checkoutUrl = signal<string | null>(null);
  paymentStatus = signal<string | null>(null);
  errorMessage = signal('');
  copied = signal(false);

  createCheckout(): void {
    const quote = this.quoteService.confirmedQuote();

    if (!quote || this.loading()) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.quoteService.createCheckout(quote.quotationId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.checkoutUrl.set(response.checkoutUrl);
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'No se pudo generar el enlace de pago.'
          );
        }
      });
  }

  verifyPayment(): void {
    const quote = this.quoteService.confirmedQuote();

    if (!quote || this.verifying() || this.paymentStatus() === 'paid') return;

    this.verifying.set(true);
    this.errorMessage.set('');

    this.quoteService.verifyPayment(quote.quotationId)
      .pipe(finalize(() => this.verifying.set(false)))
      .subscribe({
        next: (response) => {
          this.paymentStatus.set(response.status);
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'No se pudo verificar el pago.'
          );
        }
      });
  }

  async copyCheckoutUrl(): Promise<void> {
    const url = this.checkoutUrl();
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      this.copied.set(true);
    } catch {
      this.errorMessage.set('No se pudo copiar el enlace.');
    }
  }
}
