import { Component, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { finalize } from 'rxjs';
import { QuoteService, CheckoutBillingData } from '../../../../services/quote';
import { ToastService } from '../../../../services/toast';
import { RegexConstants } from '../../../../utils/regex-constants';

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
  issuedReceiptType = signal<string | null>(null);
  issuedDocumentNumber = signal<string | null>(null);
  copied = signal(false);

  receiptType = signal<'boleta' | 'factura'>('boleta');
  dni = signal('');
  taxId = signal('');
  companyName = signal('');
  fiscalAddress = signal('');
  dniTouched = signal(false);
  taxIdTouched = signal(false);
  searchingRuc = signal(false);

  isDniValid(): boolean {
    return /^[0-9]{8}$/.test(this.dni().trim());
  }

  isTaxIdValid(): boolean {
    return /^[0-9]{11}$/.test(this.taxId().trim());
  }

  isFormValid(): boolean {
    if (this.receiptType() === 'boleta') {
      return this.isDniValid();
    }
    return this.isTaxIdValid() &&
           this.companyName().trim().length > 0 &&
           this.fiscalAddress().trim().length > 0;
  }

  onDniInput(event: Event): void {
    RegexConstants.number(event);
    const input = event.target as HTMLInputElement;
    if (input.value.length > 8) {
      input.value = input.value.slice(0, 8);
    }
    this.dni.set(input.value);
  }

  onTaxIdInput(event: Event): void {
    RegexConstants.number(event);
    const input = event.target as HTMLInputElement;
    if (input.value.length > 11) {
      input.value = input.value.slice(0, 11);
    }
    const val = input.value;
    this.taxId.set(val);

    if (val.length === 11) {
      this.consultRuc(val);
    }
  }

  consultRuc(rucNumber: string): void {
    this.searchingRuc.set(true);
    this.quoteService.getRucInfo(rucNumber)
      .pipe(finalize(() => this.searchingRuc.set(false)))
      .subscribe({
        next: (info) => {
          if (info) {
            if (info.businessName) this.companyName.set(info.businessName);
            if (info.fiscalAddress) this.fiscalAddress.set(info.fiscalAddress);
            this.toastService.show('Datos de RUC encontrados y autocompletados.', 'success');
          }
        },
        error: () => {
          // Si no existe en la base local, el usuario puede ingresarlos manualmente
        }
      });
  }

  onCompanyNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.companyName.set(input.value);
  }

  onFiscalAddressInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fiscalAddress.set(input.value);
  }

  private getBillingData(): CheckoutBillingData {
    if (this.receiptType() === 'boleta') {
      return {
        receiptType: 'boleta',
        dni: this.dni().trim()
      };
    } else {
      return {
        receiptType: 'factura',
        ruc: this.taxId().trim(),
        businessName: this.companyName().trim(),
        fiscalAddress: this.fiscalAddress().trim()
      };
    }
  }

  createCheckout(): void {
    const quote = this.quoteService.confirmedQuote();

    if (!quote || this.loading() || !this.isFormValid()) return;

    this.loading.set(true);

    this.quoteService.createCheckout(quote.quotationId, this.getBillingData())
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

    this.quoteService.verifyPayment(quote.quotationId, this.getBillingData())
      .pipe(finalize(() => this.verifying.set(false)))
      .subscribe({
        next: (response) => {
          this.paymentStatus.set(response.status);
          if (response.receiptType) this.issuedReceiptType.set(response.receiptType);
          if (response.documentNumber) this.issuedDocumentNumber.set(response.documentNumber);

          if (response.status === 'paid') {
            const docInfo = response.documentNumber ? ` Comprobante: ${response.documentNumber}` : '';
            this.toastService.show(`¡Pago acreditado correctamente!${docInfo}`, 'success');
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
