import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
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

  packages = signal<any[]>([]);
  loading = signal(true);
  selectedPackage = signal<any | null>(null);
  packageToDelete = signal<any | null>(null);
  deletingId = signal<string | null>(null);

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

  downloadReceipt(pkg: any): void {
    const user = this.sessionService.getUserSession();
    const isFactura = pkg.receiptType === 'factura';
    const docTitle = isFactura ? 'Factura Electrónica' : 'Boleta de Venta Electrónica';
    const docNumber = pkg.documentNumber || pkg.quotationId;
    const clientName = isFactura ? (pkg.businessName || user?.names || 'Cliente Registrado') : (user?.names || 'Cliente Registrado');
    const clientDoc = isFactura ? (pkg.ruc ? `RUC: ${pkg.ruc}` : '') : '';
    const clientAddress = isFactura ? (pkg.fiscalAddress ? `<p><strong>Dirección Fiscal:</strong> ${pkg.fiscalAddress}</p>` : '') : '';
    const clientEmail = user?.email || 'N/A';
    const totalAmount = Number(pkg.total || 0);
    const subtotal = totalAmount / 1.18;
    const igv = totalAmount - subtotal;
    const paymentRef = pkg.transactionId ? `TX-${pkg.transactionId}` : (pkg.mpOrderId || ('REC-' + (pkg.quotationId || '0000')));
    const receiptDate = (pkg.transactionDate ? new Date(pkg.transactionDate) : new Date()).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Comprobante de Pago - ${pkg.quotationId}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 40px; font-size: 14px; background: #fff; }
          @media print {
            body { padding: 20px; }
            button { display: none !important; }
          }
          .receipt-box { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: 800; color: #0F172A; }
          .logo span { color: #FF3B30; }
          .doc-badge { background: #198754; color: #fff; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 13px; text-transform: uppercase; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
          .detail-card { background: #f8fafc; border: 1px solid #edf2f7; border-radius: 8px; padding: 16px; }
          .detail-card h3 { font-size: 12px; text-transform: uppercase; color: #64748b; margin-bottom: 8px; letter-spacing: 0.05em; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .table th { background: #0F172A; color: #fff; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; }
          .table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          .totals { margin-left: auto; width: 280px; margin-bottom: 24px; }
          .totals-row { display: flex; justify-content: space-between; padding: 6px 0; color: #64748b; }
          .totals-row.final { border-top: 2px solid #0F172A; color: #0F172A; font-weight: 700; font-size: 16px; padding-top: 10px; margin-top: 4px; }
          .footer { text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <div>
              <div class="logo">Peru<span>TOURS</span></div>
              <p style="color:#64748b; font-size:12px; margin-top:4px;">Agencia de Turismo TAWS S.A.C.</p>
              <p style="color:#64748b; font-size:12px;">RUC: 20601234567 | Lima, Perú</p>
            </div>
            <div style="text-align: right;">
              <span class="doc-badge">${docTitle}</span>
              <p style="font-weight:700; margin-top:8px; font-size:15px; color:#0F172A;">N° ${docNumber}</p>
              <p style="color:#64748b; font-size:12px;">Fecha: ${receiptDate}</p>
            </div>
          </div>

          <div class="details-grid">
            <div class="detail-card">
              <h3>Datos del Cliente</h3>
              <p><strong>Titular / Razón Social:</strong> ${clientName}</p>
              ${clientDoc ? `<p><strong>${clientDoc}</strong></p>` : ''}
              ${clientAddress}
              <p><strong>Email:</strong> ${clientEmail}</p>
              <p><strong>Pasajeros:</strong> ${pkg.peopleQuantity} persona(s)</p>
            </div>
            <div class="detail-card">
              <h3>Datos de la Transacción</h3>
              <p><strong>Estado:</strong> <span style="color:#198754; font-weight:700;">PAGADO</span></p>
              <p><strong>Transacción / Ref:</strong> ${paymentRef}</p>
              <p><strong>Medio de Pago:</strong> Mercado Pago / Tarjeta</p>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Ruta</th>
                <th>Fechas</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Paquete Turístico Completo</strong><br>
                  <span style="color:#64748b; font-size:12px;">Incluye vuelos, hospedaje y cronograma de actividades turísticas</span>
                </td>
                <td>${pkg.departureRegion} &rarr; ${pkg.destinationRegion}</td>
                <td>${pkg.departureDate} al ${pkg.returnDate}</td>
                <td style="text-align: right; font-weight:600;">S/ ${totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Op. Gravada:</span>
              <span>S/ ${subtotal.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>I.G.V. (18%):</span>
              <span>S/ ${igv.toFixed(2)}</span>
            </div>
            <div class="totals-row final">
              <span>Total Pagado:</span>
              <span>S/ ${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div class="footer">
            <p>Este documento constituye un comprobante formal de pago emitido electrónicamente.</p>
            <p>¡Gracias por tu preferencia y feliz viaje con Peru TOURS!</p>
          </div>
        </div>
      </body>
      </html>`;

    const printWindow = window.open('', '_blank', 'width=900,height=750');
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
