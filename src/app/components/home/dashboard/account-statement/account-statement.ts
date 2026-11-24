import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuoteService } from '../../../../services/quote';
import { ToastService } from '../../../../services/toast';
import { SessionService } from '../../../../services/session';

@Component({
  selector: 'app-account-statement',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe, FormsModule],
  templateUrl: './account-statement.html',
  styleUrl: './account-statement.scss'
})
export class AccountStatement implements OnInit {
  private quoteService = inject(QuoteService);
  private toastService = inject(ToastService);
  private sessionService = inject(SessionService);

  allPackages = signal<any[]>([]);
  packages = signal<any[]>([]);
  loading = signal(true);
  selectedPackage = signal<any | null>(null);

  // Filtros
  filterStartDate = signal<string>('');
  filterEndDate = signal<string>('');
  filterMinAmount = signal<number | null>(null);
  filterMaxAmount = signal<number | null>(null);
  filterQuotationId = signal<string>('');
  filterStatus = signal<string>('');

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
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
        this.allPackages.set(mapped);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => {
        this.toastService.show('No se pudo cargar el estado de cuenta.', 'danger');
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    let result = [...this.allPackages()];

    const start = this.filterStartDate();
    if (start) {
      result = result.filter(p => p.departureDate && p.departureDate >= start);
    }

    const end = this.filterEndDate();
    if (end) {
      result = result.filter(p => p.returnDate && p.returnDate <= end);
    }

    const min = this.filterMinAmount();
    if (min !== null && min !== undefined) {
      result = result.filter(p => Number(p.total || 0) >= min);
    }

    const max = this.filterMaxAmount();
    if (max !== null && max !== undefined) {
      result = result.filter(p => Number(p.total || 0) <= max);
    }

    const qId = this.filterQuotationId().trim().toLowerCase();
    if (qId) {
      result = result.filter(p => p.quotationId && p.quotationId.toLowerCase().includes(qId));
    }

    const st = this.filterStatus().trim().toLowerCase();
    if (st) {
      result = result.filter(p => p.status && p.status.toLowerCase() === st);
    }

    this.packages.set(result);
  }

  resetFilters(): void {
    this.filterStartDate.set('');
    this.filterEndDate.set('');
    this.filterMinAmount.set(null);
    this.filterMaxAmount.set(null);
    this.filterQuotationId.set('');
    this.filterStatus.set('');
    this.applyFilters();
  }

  viewDetail(pkg: any): void {
    this.selectedPackage.set(pkg);
  }

  closeDetail(): void {
    this.selectedPackage.set(null);
  }

  getStatusLabel(status: string): string {
    if (status === 'paid') return 'Pagado';
    if (status === 'pending') return 'Pendiente';
    return status || 'Sin estado';
  }

  getStatusClass(status: string): string {
    if (status === 'paid') return 'status-paid';
    if (status === 'pending') return 'status-pending';
    return 'status-default';
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
        <title>Comprobante de Pago - ${docNumber}</title>
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
