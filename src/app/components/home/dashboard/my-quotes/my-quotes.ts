import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, timeout, TimeoutError } from 'rxjs';
import { QuoteService } from '../../../../services/quote';
import { QuoteResponse } from '../../../../model/response/quoteResponse';
import { ToastService } from '../../../../services/toast';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-quotes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-quotes.html',
})
export class MyQuotes {
  private quoteService = inject(QuoteService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  cotizaciones = this.quoteService.cotizaciones;
  selectedDetail: QuoteResponse | null = null;
  quoteToConfirm: QuoteResponse | null = null;
  confirmingId: string | null = null;
  confirmedQuoteId: string | null = this.quoteService.confirmedQuote()?.proposal.proposalId ?? null;
  uncertainResult = false;

  viewDetail(quote: QuoteResponse): void {
    this.selectedDetail = this.selectedDetail?.proposalId === quote.proposalId ? null : quote;
  }

  requestConfirmation(quote: QuoteResponse): void {
    if (this.confirmingId !== null || this.confirmedQuoteId !== null || this.uncertainResult) return;
    this.quoteToConfirm = quote;
  }

  cancelConfirmation(): void {
    if (this.confirmingId !== null) return;
    this.quoteToConfirm = null;
  }

  confirmQuote(): void {
    const quote = this.quoteToConfirm;
    if (!quote || this.confirmingId !== null || this.confirmedQuoteId !== null || this.uncertainResult) return;

    this.confirmingId = quote.proposalId;

    this.quoteService.confirmQuote(quote).pipe(
      timeout(30000),
      finalize(() => { this.confirmingId = null; this.cdr.markForCheck(); })
    ).subscribe({
      next: (response) => {
        this.confirmedQuoteId = quote.proposalId;
        this.quoteToConfirm = null;
        this.cdr.markForCheck();
        this.toastService.show(`Cotización ${response.quotationId} guardada correctamente.`, 'success');
        this.router.navigate(['/dashboard/nueva-cotizacion/pagar']);
      },
      error: (err) => {
        this.quoteToConfirm = null;
        if (err instanceof TimeoutError || err.status === 0 || err.status === 200) {
          this.uncertainResult = true;
          this.toastService.show('No se pudo verificar la respuesta. Comprueba si la cotización ya se guardó en Neon.', 'warning');
        } else {
          this.toastService.show(err.error?.message || 'No se pudo confirmar la cotización.', 'danger');
        }
        this.cdr.markForCheck();
      }
    });
  }
}