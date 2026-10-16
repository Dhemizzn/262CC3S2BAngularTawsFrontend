
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, timeout, TimeoutError } from 'rxjs';
import { QuoteService } from '../../../../services/quote';
import { QuoteResponse } from '../../../../model/response/quoteResponse';
import { ToastService } from '../../../../services/toast';

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

  cotizaciones = this.quoteService.cotizaciones;

  detalleSeleccionado: QuoteResponse | null = null;
  cotizacionPorConfirmar: QuoteResponse | null = null;

  confirmandoId: string | null = null;
  cotizacionConfirmada: string | null = null;

  resultadoIncierto = false;

  verDetalle(cotizacion: QuoteResponse): void {
    this.detalleSeleccionado =
      this.detalleSeleccionado?.proposalId === cotizacion.proposalId
        ? null
        : cotizacion;
  }

  solicitarConfirmacion(cotizacion: QuoteResponse): void {
    if (
      this.confirmandoId !== null ||
      this.cotizacionConfirmada !== null ||
      this.resultadoIncierto
    ) {
      return;
    }

    this.cotizacionPorConfirmar = cotizacion;
  }

  cancelarConfirmacion(): void {
    if (this.confirmandoId !== null) return;

    this.cotizacionPorConfirmar = null;
  }

  confirmarCotizacion(): void {
    const cotizacion = this.cotizacionPorConfirmar;

    if (
      !cotizacion ||
      this.confirmandoId !== null ||
      this.cotizacionConfirmada !== null ||
      this.resultadoIncierto
    ) {
      return;
    }

    this.confirmandoId = cotizacion.proposalId;

    this.quoteService.confirmQuote(cotizacion)
      .pipe(
        timeout(30000),
        finalize(() => {
          this.confirmandoId = null;
          this.cdr.markForCheck();
        })
      )
      .subscribe({

        next: (response) => {
          console.log('Respuesta de confirmación:', response);

          this.cotizacionConfirmada = cotizacion.proposalId;
          this.cotizacionPorConfirmar = null;

          this.cdr.markForCheck();

          this.toastService.show(
            `Cotización ${response.quotationId} guardada correctamente.`,
            'success'
          );
        },

        error: (err) => {
          console.error('Error al confirmar:', err);

          this.cotizacionPorConfirmar = null;

          if (
            err instanceof TimeoutError ||
            err.status === 0 ||
            err.status === 200
          ) {
            this.resultadoIncierto = true;

            this.toastService.show(
              'No se pudo verificar la respuesta. Comprueba si la cotización ya se guardó en Neon.',
              'warning'
            );
          } else {
            this.toastService.show(
              err.error?.message || 'No se pudo confirmar la cotización.',
              'danger'
            );
          }

          this.cdr.markForCheck();
        }

      });
  }
}
