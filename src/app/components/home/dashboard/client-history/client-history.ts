import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminPackageService } from '../../../../services/admin-package';
import { ToastService } from '../../../../services/toast';
import { AdminPackage, AdminPackageFilter } from '../../../../model/admin-package';

@Component({
  selector: 'app-client-history',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe, FormsModule],
  templateUrl: './client-history.html',
  styleUrl: './client-history.scss',
})
export class ClientHistory implements OnInit {
  private adminPackageService = inject(AdminPackageService);
  private toastService = inject(ToastService);

  packages = signal<AdminPackage[]>([]);
  loading = signal(true);
  selectedPackage = signal<AdminPackage | null>(null);

  // Filters
  filterStartDate = signal<string>('');
  filterEndDate = signal<string>('');
  filterMinAmount = signal<number | null>(null);
  filterMaxAmount = signal<number | null>(null);
  filterUserId = signal<number | null>(null);
  filterQuotationId = signal<string>('');
  filterStatus = signal<string>('');

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    this.loading.set(true);

    const filters: AdminPackageFilter = {};
    if (this.filterStartDate()) filters.startDate = this.filterStartDate();
    if (this.filterEndDate()) filters.endDate = this.filterEndDate();
    if (this.filterMinAmount() !== null && this.filterMinAmount() !== undefined) {
      filters.minAmount = this.filterMinAmount()!;
    }
    if (this.filterMaxAmount() !== null && this.filterMaxAmount() !== undefined) {
      filters.maxAmount = this.filterMaxAmount()!;
    }
    if (this.filterUserId() !== null && this.filterUserId() !== undefined) {
      filters.userId = this.filterUserId()!;
    }
    if (this.filterQuotationId()) filters.quotationId = this.filterQuotationId();
    if (this.filterStatus()) filters.status = this.filterStatus();

    this.adminPackageService.getPackages(filters).subscribe({
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
        this.toastService.show('Error al cargar el historial de clientes.', 'danger');
        this.loading.set(false);
      }
    });
  }

  resetFilters(): void {
    this.filterStartDate.set('');
    this.filterEndDate.set('');
    this.filterMinAmount.set(null);
    this.filterMaxAmount.set(null);
    this.filterUserId.set(null);
    this.filterQuotationId.set('');
    this.filterStatus.set('');
    this.search();
  }

  viewDetail(pkg: AdminPackage): void {
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

  exportToCsv(): void {
    const data = this.packages();
    if (!data.length) {
      this.toastService.show('No hay datos para exportar.', 'warning');
      return;
    }

    const headers = [
      'ID Paquete',
      'ID Cliente',
      'Nombre Cliente',
      'DNI',
      'Email',
      'Origen',
      'Destino',
      'Fecha Salida',
      'Fecha Retorno',
      'Pasajeros',
      'Monto Total (S/)',
      'Estado',
      'Orden MP'
    ];

    const rows = data.map((p) => [
      p.quotationId,
      p.userId,
      `"${p.clientName?.replace(/"/g, '""') || ''}"`,
      p.clientDni || '',
      p.clientEmail || '',
      `"${p.departureRegion || ''}"`,
      `"${p.destinationRegion || ''}"`,
      p.departureDate || '',
      p.returnDate || '',
      p.peopleQuantity,
      Number(p.total || 0).toFixed(2),
      p.status,
      p.mpOrderId || ''
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(';'),
      ...rows.map(r => r.join(';'))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `historial_clientes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.toastService.show('Datos exportados a CSV con éxito.', 'success');
  }
}
