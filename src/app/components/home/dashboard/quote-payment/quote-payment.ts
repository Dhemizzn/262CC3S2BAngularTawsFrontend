import { Component, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { finalize } from 'rxjs';
import { QuoteService } from '../../../../services/quote';
import { ToastService } from '../../../../services/toast';

@Component({
  selector: 'app-quote-payment',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './quote-payment.html',
  styleUrl: './quote-payment.scss'
})
export class QuotePayment {
  quoteService = inject(QuoteService);
  private toastService = inject(ToastService);

  loading = signal(false);
  verifying = signal(false);
  checkoutUrl = signal<string | null>(null);
  paymentStatus = signal<string | null>(null);
  copied = signal(false);

  receiptType = signal<'boleta' | 'factura'>('boleta');
  taxId = signal('');
  companyName = signal('');
  fiscalAddress = signal('');
  taxIdTouched = signal(false);

  isTaxIdValid(): boolean {
    return /^[0-9]{11}$/.test(this.taxId().trim());
  }

  isFormValid(): boolean {
    if (this.receiptType() === 'boleta') {
      return true;
    }
    return this.isTaxIdValid() && this.companyName().trim().length > 0;
  }

  onTaxIdInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const numericOnly = input.value.replace(/\D/g, '').slice(0, 11);
    this.taxId.set(numericOnly);
  }

  onCompanyNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.companyName.set(input.value);
  }

  onFiscalAddressInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fiscalAddress.set(input.value);
  }

  createCheckout(): void {
    const quote = this.quoteService.confirmedQuote();

    if (!quote || this.loading() || !this.isFormValid()) return;

    this.loading.set(true);

    this.quoteService.createCheckout(quote.quotationId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.checkoutUrl.set(response.checkoutUrl);
          this.toastService.show('Enlace de pago generado con éxito.', 'info');
        },
        error: (err) => {
          const message = err.error?.message || 'No se pudo generar el enlace de pago.';
          this.toastService.show(message, 'danger');
        }
      });
  }

  verifyPayment(): void {
    const quote = this.quoteService.confirmedQuote();

    if (!quote || this.verifying() || this.paymentStatus() === 'paid') return;

    this.verifying.set(true);

    this.quoteService.verifyPayment(quote.quotationId)
      .pipe(finalize(() => this.verifying.set(false)))
      .subscribe({
        next: (response) => {
          this.paymentStatus.set(response.status);
          if (response.status === 'paid') {
            this.toastService.show('¡Pago acreditado correctamente!', 'success');
          } else {
            this.toastService.show('El pago aún no figura como acreditado.', 'warning');
          }
        },
        error: (err) => {
          const message = err.error?.message || 'No se pudo verificar el pago.';
          this.toastService.show(message, 'danger');
        }
      });
  }

  async copyCheckoutUrl(): Promise<void> {
    const url = this.checkoutUrl();
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      this.copied.set(true);
      this.toastService.show('Enlace de pago copiado al portapapeles.', 'success');
    } catch {
      this.toastService.show('No se pudo copiar el enlace.', 'danger');
    }
  }
}
