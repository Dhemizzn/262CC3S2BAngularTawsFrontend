import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuoteService } from '../../../../services/quote';
import { QuoteResponse } from '../../../../model/response/quoteResponse';

@Component({
  selector: 'app-my-quotes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-quotes.html',
})
export class MyQuotes {

  private quoteService = inject(QuoteService);

  cotizaciones = this.quoteService.cotizaciones;

  detalleSeleccionado: QuoteResponse | null = null;

  confirmando = false;
  cotizacionConfirmada: string | null = null;
  mensajeConfirmacion = '';
  errorConfirmacion = '';

  verDetalle(cotizacion: QuoteResponse): void {
    this.detalleSeleccionado =
      this.detalleSeleccionado?.proposalId === cotizacion.proposalId
        ? null
        : cotizacion;
  }

  confirmarCotizacion(cotizacion: QuoteResponse): void {

    if (this.confirmando || this.cotizacionConfirmada) return;

    const aceptar = window.confirm(
      '¿Deseas confirmar esta cotización?'
    );

    if (!aceptar) return;

    this.confirmando = true;
    this.errorConfirmacion = '';

    this.quoteService.confirmQuote(cotizacion).subscribe({

      next: (response) => {
        this.confirmando = false;
        this.cotizacionConfirmada = cotizacion.proposalId;

        this.mensajeConfirmacion =
          `Cotización ${response.quotationId} guardada correctamente. Estado: ${response.status}`;
      },

      error: (err) => {
        this.confirmando = false;
        console.error(err);

        this.errorConfirmacion =
          err.error?.message || 'No se pudo confirmar la cotización.';
      }

    });
  }
}
