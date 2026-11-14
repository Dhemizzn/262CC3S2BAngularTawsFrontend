import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { QuoteService } from '../../../../services/quote';
import { ToastService } from '../../../../services/toast';

@Component({
  selector: 'app-package-history',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe],
  templateUrl: './package-history.html',
  styleUrl: './package-history.scss',
})
export class PackageHistory implements OnInit {
  private quoteService = inject(QuoteService);
  private toastService = inject(ToastService);

  paquetes = signal<any[]>([]);
  cargando = signal(true);
  errorMessage = signal('');
  paqueteSeleccionado = signal<any | null>(null);
  paquetePorEliminar = signal<any | null>(null);
  eliminando = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarPaquetes();
  }

  cargarPaquetes(): void {
    this.cargando.set(true);
    this.errorMessage.set('');

    this.quoteService.getMyPackages().subscribe({
      next: (data) => {
        const mapeados = data.map((item) => {
          let parsedItinerary = null;
          if (item.itinerary) {
            try {
              parsedItinerary = typeof item.itinerary === 'string'
                ? JSON.parse(item.itinerary)
                : item.itinerary;
            } catch {
              parsedItinerary = null;
            }
          }
          return {
            ...item,
            parsedItinerary
          };
        });
        this.paquetes.set(mapeados);
        this.cargando.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar los paquetes turísticos.');
        this.cargando.set(false);
      }
    });
  }

  verCronograma(paquete: any): void {
    this.paqueteSeleccionado.set(paquete);
  }

  cerrarCronograma(): void {
    this.paqueteSeleccionado.set(null);
  }

  solicitarEliminacion(paquete: any): void {
    if (this.eliminando() !== null) return;
    this.paquetePorEliminar.set(paquete);
  }

  cancelarEliminacion(): void {
    if (this.eliminando() !== null) return;
    this.paquetePorEliminar.set(null);
  }

  confirmarEliminacion(): void {
    const paquete = this.paquetePorEliminar();
    if (!paquete || this.eliminando() !== null) return;

    this.eliminando.set(paquete.quotationId);
    this.quoteService.cancelPackage(paquete.quotationId).subscribe({
      next: () => {
        this.paquetes.update(lista => lista.filter(p => p.quotationId !== paquete.quotationId));
        this.toastService.show(`Solicitud ${paquete.quotationId} eliminada correctamente.`, 'success');
        this.eliminando.set(null);
        this.paquetePorEliminar.set(null);
      },
      error: (err) => {
        console.error('Error al eliminar paquete:', err);
        const detalle = err.error?.message 
          || (err.status === 404 ? 'Ruta no encontrada en el servidor (404). Verifica reiniciar el backend.' : '')
          || (err.status === 405 ? 'Método DELETE no permitido en el servidor (405).' : '')
          || (err.status === 403 ? 'No autorizado para eliminar (403).' : '')
          || 'No se pudo eliminar la solicitud. Inténtalo nuevamente.';
        this.toastService.show(detalle, 'danger');
        this.eliminando.set(null);
        this.paquetePorEliminar.set(null);
      }
    });
  }

  obtenerEstadoLabel(status: string): string {
    if (status === 'paid') return 'Confirmado';
    if (status === 'pending') return 'Esperando respuesta';
    return status || 'Sin estado';
  }

  obtenerEstadoBadge(status: string): string {
    if (status === 'paid') return 'text-white';
    if (status === 'pending') return 'text-white';
    return 'text-white';
  }

  obtenerEstadoColor(status: string): string {
    if (status === 'paid') return '#198754';
    if (status === 'pending') return '#e63946';
    return '#6c757d';
  }

  descargarItinerario(paquete: any): void {
    const it = paquete.parsedItinerary;
    const estadoColor = this.obtenerEstadoColor(paquete.status);
    const estadoLabel = this.obtenerEstadoLabel(paquete.status);

    let actividadesHtml = '';
    if (it?.activities?.length > 0) {
      actividadesHtml = it.activities.map((act: any, idx: number) => `
        <div style="border:1px solid #e9ecef; border-radius:8px; padding:12px; margin-bottom:8px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <span style="background:#1a1f2e; color:#fff; border-radius:20px; padding:2px 10px; font-size:11px; margin-right:8px;">Día ${idx + 1}</span>
              <strong>${act.name}</strong>
            </div>
            <span style="font-weight:600; white-space:nowrap;">S/ ${Number(act.pricePerPerson).toFixed(2)} / pers.</span>
          </div>
          <p style="color:#6c757d; font-size:12px; margin:6px 0 0 0;">
            ${act.date} &nbsp;&middot;&nbsp; ${act.startTime} - ${act.endTime} (${act.durationMinutes} min)
          </p>
        </div>`).join('');
    } else {
      actividadesHtml = '<p style="color:#6c757d; font-size:13px;">No hay actividades registradas.</p>';
    }

    const hotelHtml = it?.hotel ? `
      <div style="flex:1; border:1px solid #e9ecef; border-radius:8px; padding:14px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          <span style="color:#e63946; font-size:16px;">&#127970;</span>
          <strong>Hospedaje</strong>
        </div>
        <p style="margin:4px 0; font-size:13px;"><span style="color:#6c757d;">Hotel:</span> <strong>${it.hotel.name}</strong></p>
        <p style="margin:4px 0; font-size:13px;"><span style="color:#6c757d;">Noches:</span> ${it.hotel.nights}</p>
        <p style="margin:4px 0; font-size:13px;"><span style="color:#6c757d;">Habitaciones:</span> ${it.hotel.rooms}</p>
      </div>` : '';

    const avionHtml = it?.airplane ? `
      <div style="flex:1; border:1px solid #e9ecef; border-radius:8px; padding:14px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          <span style="color:#e63946; font-size:16px;">&#9992;</span>
          <strong>Transporte Aéreo</strong>
        </div>
        <p style="margin:4px 0; font-size:13px;"><span style="color:#6c757d;">Aerolínea:</span> <strong>${it.airplane.airline}</strong></p>
        <p style="margin:4px 0; font-size:13px;"><span style="color:#6c757d;">Salida:</span> ${it.airplane.outboundTime}</p>
        <p style="margin:4px 0; font-size:13px;"><span style="color:#6c757d;">Retorno:</span> ${it.airplane.returnTime}</p>
      </div>` : '';

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Itinerario - ${paquete.quotationId}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #212529; padding: 32px; font-size: 14px; }
          @media print {
            body { padding: 16px; }
            button { display: none !important; }
          }
        </style>
      </head>
      <body>
        <!-- Encabezado -->
        <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:20px; border-bottom:2px solid #e9ecef; margin-bottom:24px;">
          <div>
            <h1 style="font-size:22px; font-weight:700; color:#1a1f2e; margin-bottom:4px;">Agencia de Turismo TAWS</h1>
            <p style="color:#6c757d; font-size:13px;">Itinerario de Viaje</p>
          </div>
          <div style="text-align:right;">
            <span style="background:#e63946; color:#fff; border-radius:6px; padding:4px 14px; font-size:12px; font-weight:600;">${paquete.quotationId}</span>
            <p style="color:#6c757d; font-size:12px; margin-top:6px;">Generado: ${new Date().toLocaleDateString('es-PE')}</p>
          </div>
        </div>

        <!-- Resumen del viaje -->
        <div style="background:#f8f9fa; border:1px solid #e9ecef; border-radius:10px; padding:16px; margin-bottom:24px;">
          <h2 style="font-size:14px; font-weight:700; color:#1a1f2e; margin-bottom:12px; text-transform:uppercase; letter-spacing:0.05em;">Resumen del Viaje</h2>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div><span style="color:#6c757d;">Ruta:</span> <strong>${paquete.departureRegion} → ${paquete.destinationRegion}</strong></div>
            <div><span style="color:#6c757d;">Pasajeros:</span> <strong>${paquete.peopleQuantity}</strong></div>
            <div><span style="color:#6c757d;">Partida:</span> <strong>${paquete.departureDate}</strong></div>
            <div><span style="color:#6c757d;">Retorno:</span> <strong>${paquete.returnDate}</strong></div>
            <div><span style="color:#6c757d;">Total:</span> <strong>S/ ${Number(paquete.total).toFixed(2)}</strong></div>
            <div><span style="color:#6c757d;">Estado:</span>
              <span style="background:${estadoColor}; color:#fff; border-radius:20px; padding:2px 10px; font-size:12px; font-weight:600;">${estadoLabel}</span>
            </div>
          </div>
        </div>

        <!-- Hotel y Vuelo -->
        ${(it?.hotel || it?.airplane) ? `
        <div style="display:flex; gap:16px; margin-bottom:24px;">
          ${hotelHtml}
          ${avionHtml}
        </div>` : ''}

        <!-- Actividades -->
        <div style="margin-bottom:24px;">
          <h2 style="font-size:14px; font-weight:700; color:#1a1f2e; margin-bottom:12px; text-transform:uppercase; letter-spacing:0.05em;">Actividades Programadas</h2>
          ${actividadesHtml}
        </div>

        <!-- Pie -->
        <div style="border-top:1px solid #e9ecef; padding-top:16px; text-align:center; color:#6c757d; font-size:12px;">
          Gracias por elegir Agencia de Turismo TAWS &mdash; Peru Tours
        </div>
      </body>
      </html>`;

    const ventana = window.open('', '_blank', 'width=900,height=700');
    if (ventana) {
      ventana.document.write(html);
      ventana.document.close();
      ventana.focus();
      setTimeout(() => {
        ventana.print();
      }, 500);
    }
  }
}
