import { Component, OnInit, HostListener, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { QuoteService } from '../../../../services/quote';
import { ToastService } from '../../../../services/toast';
import { SessionService } from '../../../../services/session';

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
  private sessionService = inject(SessionService);
  private router = inject(Router);

  packages = signal<any[]>([]);
  loading = signal(true);
  selectedPackage = signal<any | null>(null);
  packageToDelete = signal<any | null>(null);
  deletingId = signal<string | null>(null);
  openDropdownId = signal<string | null>(null);

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.openDropdownId() !== null) {
      this.openDropdownId.set(null);
    }
  }

  toggleDropdown(quotationId: string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.openDropdownId() === quotationId) {
      this.openDropdownId.set(null);
    } else {
      this.openDropdownId.set(quotationId);
    }
  }

  closeDropdown(): void {
    this.openDropdownId.set(null);
  }

  ngOnInit(): void {
    this.loadPackages();
  }

  loadPackages(): void {
    this.loading.set(true);

    this.quoteService.getMyPackages().subscribe({
      next: (data) => {
        const mapped = data.map((item) => {
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
        this.packages.set(mapped);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.show('No se pudieron cargar los paquetes turísticos.', 'danger');
        this.loading.set(false);
      }
    });
  }

  viewSchedule(pkg: any): void {
    this.selectedPackage.set(pkg);
  }

  closeSchedule(): void {
    this.selectedPackage.set(null);
  }

  requestDeletion(pkg: any): void {
    if (this.deletingId() !== null) return;
    this.packageToDelete.set(pkg);
  }

  cancelDeletion(): void {
    if (this.deletingId() !== null) return;
    this.packageToDelete.set(null);
  }

  confirmDeletion(): void {
    const pkg = this.packageToDelete();
    if (!pkg || this.deletingId() !== null) return;

    this.deletingId.set(pkg.quotationId);
    this.quoteService.cancelPackage(pkg.quotationId).subscribe({
      next: () => {
        this.packages.update(list => list.filter(p => p.quotationId !== pkg.quotationId));
        this.toastService.show(`Solicitud ${pkg.quotationId} eliminada correctamente.`, 'success');
        this.deletingId.set(null);
        this.packageToDelete.set(null);
      },
      error: (err) => {
        console.error('Error al eliminar paquete:', err);
        const detail = err.error?.message 
          || (err.status === 404 ? 'Ruta no encontrada en el servidor (404). Verifica reiniciar el backend.' : '')
          || (err.status === 405 ? 'Método DELETE no permitido en el servidor (405).' : '')
          || (err.status === 403 ? 'No autorizado para eliminar (403).' : '')
          || 'No se pudo eliminar la solicitud. Inténtalo nuevamente.';
        this.toastService.show(detail, 'danger');
        this.deletingId.set(null);
        this.packageToDelete.set(null);
      }
    });
  }

  copyCheckoutUrl(pkg: any): void {
    if (!pkg.mpCheckoutUrl) {
      this.toastService.show('No hay enlace de Mercado Pago generado aún para esta cotización.', 'warning');
      return;
    }
    navigator.clipboard.writeText(pkg.mpCheckoutUrl).then(() => {
      this.toastService.show('Enlace de pago copiado al portapapeles.', 'success');
    }).catch(() => {
      this.toastService.show('No se pudo copiar el enlace al portapapeles.', 'danger');
    });
  }

  continuePayment(pkg: any): void {
    const itinerary = pkg.parsedItinerary || {};
    const proposal: any = {
      proposalId: pkg.quotationId,
      departureCity: pkg.departureRegion,
      destination: pkg.destinationRegion,
      passengerCount: pkg.peopleQuantity,
      departureDate: pkg.departureDate,
      returnDate: pkg.returnDate,
      days: 0,
      hotel: itinerary.hotel || null,
      airplane: itinerary.airplane || null,
      activities: itinerary.activities || [],
      totalPrice: Number(pkg.total) || 0
    };

    this.quoteService.setConfirmedQuote(pkg.quotationId, proposal);
    this.router.navigate(['/dashboard/nueva-cotizacion/pagar']);
  }

  getStatusLabel(status: string): string {
    if (status === 'paid') return 'Confirmado';
    if (status === 'pending') return 'Esperando respuesta';
    return status || 'Sin estado';
  }

  getStatusClass(status: string): string {
    if (status === 'paid') return 'status-paid';
    if (status === 'pending') return 'status-pending';
    return 'status-default';
  }

  getStatusColor(status: string): string {
    if (status === 'paid') return '#198754';
    if (status === 'pending') return '#FF3B30';
    return '#6c757d';
  }

  downloadItinerary(pkg: any): void {
    const it = pkg.parsedItinerary;
    const statusColor = this.getStatusColor(pkg.status);
    const statusLabel = this.getStatusLabel(pkg.status);

    let activitiesHtml = '';
    if (it?.activities?.length > 0) {
      activitiesHtml = it.activities.map((act: any, idx: number) => `
        <div style="border:1px solid #e9ecef; border-radius:8px; padding:12px; margin-bottom:8px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <span style="background:#0F172A; color:#fff; border-radius:20px; padding:2px 10px; font-size:11px; margin-right:8px;">Día ${idx + 1}</span>
              <strong>${act.name}</strong>
            </div>
            <span style="font-weight:600; white-space:nowrap;">S/ ${Number(act.pricePerPerson).toFixed(2)} / pers.</span>
          </div>
          <p style="color:#6c757d; font-size:12px; margin:6px 0 0 0;">
            ${act.date} &nbsp;&middot;&nbsp; ${act.startTime} - ${act.endTime} (${act.durationMinutes} min)
          </p>
        </div>`).join('');
    } else {
      activitiesHtml = '<p style="color:#6c757d; font-size:13px;">No hay actividades registradas.</p>';
    }

    const hotelHtml = it?.hotel ? `
      <div style="flex:1; border:1px solid #e9ecef; border-radius:8px; padding:14px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          <span style="color:#FF3B30; font-size:16px;">&#127970;</span>
          <strong>Hospedaje</strong>
        </div>
        <p style="margin:4px 0; font-size:13px;"><span style="color:#6c757d;">Hotel:</span> <strong>${it.hotel.name}</strong></p>
        <p style="margin:4px 0; font-size:13px;"><span style="color:#6c757d;">Noches:</span> ${it.hotel.nights}</p>
        <p style="margin:4px 0; font-size:13px;"><span style="color:#6c757d;">Habitaciones:</span> ${it.hotel.rooms}</p>
      </div>` : '';

    const airplaneHtml = it?.airplane ? `
      <div style="flex:1; border:1px solid #e9ecef; border-radius:8px; padding:14px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          <span style="color:#FF3B30; font-size:16px;">&#9992;</span>
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
        <title>Itinerario - ${pkg.quotationId}</title>
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
            <h1 style="font-size:22px; font-weight:700; color:#0F172A; margin-bottom:4px;">Agencia de Turismo TAWS</h1>
            <p style="color:#6c757d; font-size:13px;">Itinerario de Viaje</p>
          </div>
          <div style="text-align:right;">
            <span style="background:#FF3B30; color:#fff; border-radius:6px; padding:4px 14px; font-size:12px; font-weight:600;">${pkg.quotationId}</span>
            <p style="color:#6c757d; font-size:12px; margin-top:6px;">Generado: ${new Date().toLocaleDateString('es-PE')}</p>
          </div>
        </div>

        <!-- Resumen del viaje -->
        <div style="background:#f8f9fa; border:1px solid #e9ecef; border-radius:10px; padding:16px; margin-bottom:24px;">
          <h2 style="font-size:14px; font-weight:700; color:#0F172A; margin-bottom:12px; text-transform:uppercase; letter-spacing:0.05em;">Resumen del Viaje</h2>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div><span style="color:#6c757d;">Ruta:</span> <strong>${pkg.departureRegion} → ${pkg.destinationRegion}</strong></div>
            <div><span style="color:#6c757d;">Pasajeros:</span> <strong>${pkg.peopleQuantity}</strong></div>
            <div><span style="color:#6c757d;">Partida:</span> <strong>${pkg.departureDate}</strong></div>
            <div><span style="color:#6c757d;">Retorno:</span> <strong>${pkg.returnDate}</strong></div>
            <div><span style="color:#6c757d;">Total:</span> <strong>S/ ${Number(pkg.total).toFixed(2)}</strong></div>
            <div><span style="color:#6c757d;">Estado:</span>
              <span style="background:${statusColor}; color:#fff; border-radius:20px; padding:2px 10px; font-size:12px; font-weight:600;">${statusLabel}</span>
            </div>
          </div>
        </div>

        <!-- Hotel y Vuelo -->
        ${(it?.hotel || it?.airplane) ? `
        <div style="display:flex; gap:16px; margin-bottom:24px;">
          ${hotelHtml}
          ${airplaneHtml}
        </div>` : ''}

        <!-- Actividades -->
        <div style="margin-bottom:24px;">
          <h2 style="font-size:14px; font-weight:700; color:#0F172A; margin-bottom:12px; text-transform:uppercase; letter-spacing:0.05em;">Actividades Programadas</h2>
          ${activitiesHtml}
        </div>

        <!-- Pie -->
        <div style="border-top:1px solid #e9ecef; padding-top:16px; text-align:center; color:#6c757d; font-size:12px;">
          Gracias por elegir Agencia de Turismo TAWS &mdash; Peru Tours
        </div>
      </body>
      </html>`;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }
}
