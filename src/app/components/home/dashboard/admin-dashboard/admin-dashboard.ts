import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { HighchartsChartComponent } from 'highcharts-angular';
import { ChartComponent, ApexChart, ApexAxisChartSeries, ApexNonAxisChartSeries, ApexXAxis } from 'ng-apexcharts';
import { DashboardStatsResponse } from '../../../../model/response/dashboardStatsResponse';
import { AdminDashboardService } from '../../../../services/admin-dashboard';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [ChartComponent],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {
  private dashboardService = inject(AdminDashboardService);

  stats = signal<DashboardStatsResponse | null>(null);
  loading = signal(true);
  errorMessage = signal('');

  barChart: ApexChart = { type: 'bar', height: 320, toolbar: { show: false } };
  destinationsSeries = computed<ApexAxisChartSeries>(() => [{ name: 'Cotizaciones', data: this.stats()?.destinations.map(item => item.value) ?? [] }]);
  destinationsXAxis = computed<ApexXAxis>(() => ({ categories: this.stats()?.destinations.map(item => item.label) ?? [] }));

  donutChart: ApexChart = { type: 'donut', height: 320 };
  statusesSeries = computed<ApexNonAxisChartSeries>(() => this.stats()?.statuses.map(item => item.value) ?? []);
  statusesLabels = computed(() => this.stats()?.statuses.map(item => item.label === 'paid' ? 'Pagadas' : item.label === 'pending' ? 'Pendientes' : item.label) ?? []);

  lineChart: ApexChart = { type: 'line', height: 320, toolbar: { show: false } };
  registrationsSeries = computed<ApexAxisChartSeries>(() => [{ name: 'Usuarios registrados', data: this.stats()?.registrations.map(item => item.value) ?? [] }]);
  registrationsXAxis = computed<ApexXAxis>(() => ({ categories: this.stats()?.registrations.map(item => item.label) ?? [] }));

  ngOnInit(): void {
    this.dashboardService.getStatistics().pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: response => this.stats.set(response),
      error: () => this.errorMessage.set('No se pudieron cargar las estadísticas.')
    });
  }
}