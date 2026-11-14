import { Component, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { finalize } from 'rxjs';
import { QuoteService } from '../../../../services/quote';

@Component({
  selector: 'app-quote-payment',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
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

  tipoComprobante = signal<'boleta' | 'factura'>('boleta');
  ruc = signal('');
  razonSocial = signal('');
  direccionFiscal = signal('');
  rucTouched = signal(false);

  esRucValido(): boolean {
    return /^[0-9]{11}$/.test(this.ruc().trim());
  }

  formularioValido(): boolean {
    if (this.tipoComprobante() === 'boleta') {
      return true;
    }
    return this.esRucValido() && this.razonSocial().trim().length > 0;
  }

  onRucInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const soloNumeros = input.value.replace(/\D/g, '').slice(0, 11);
    this.ruc.set(soloNumeros);
  }

  onRazonSocialInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.razonSocial.set(input.value);
  }

  onDireccionFiscalInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.direccionFiscal.set(input.value);
  }

  createCheckout(): void {
    const quote = this.quoteService.confirmedQuote();

    if (!quote || this.loading() || !this.formularioValido()) return;

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
