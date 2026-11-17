import { Component, OnInit, AfterViewInit, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexFill,
  ApexPlotOptions,
} from 'ng-apexcharts';
import { DashboardStatsResponse } from '../../../../model/response/dashboardStatsResponse';
import { AdminDashboardService } from '../../../../services/admin-dashboard';

export type LineChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  fill: ApexFill;
  forecastDataPoints: { count: number };
};

export type RadialBarChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  labels: string[];
  colors: string[];
};

export type RadarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  colors: string[];
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit, AfterViewInit {
  private dashboardService = inject(AdminDashboardService);

  stats = signal<DashboardStatsResponse | null>(null);
  loading = signal(true);
  errorMessage = signal('');

  // 1. Gráfico de Usuarios (Line chart con smooth curve, gradient fill & forecast)
  usersChartOptions: Partial<LineChartOptions> = {
    series: [
      {
        name: 'Usuarios registrados',
        data: []
      }
    ],
    chart: {
      height: 350,
      type: 'line',
      toolbar: { show: false }
    },
    forecastDataPoints: {
      count: 2
    },
    stroke: {
      width: 5,
      curve: 'smooth'
    },
    xaxis: {
      categories: []
    },
    yaxis: {
      labels: {
        formatter: (val: number) => Math.round(val).toString()
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        gradientToColors: ['#FDD835'],
        shadeIntensity: 1,
        type: 'horizontal',
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100, 100, 100]
      }
    }
  };

  // 2. Gráfico de Cotizaciones Pagadas / Pendientes (RadialBar)
  quotesRadialOptions: Partial<RadialBarChartOptions> = {
    series: [],
    chart: {
      height: 350,
      type: 'radialBar'
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: '22px'
          },
          value: {
            fontSize: '16px',
            formatter: (val: number) => Math.round(val) + '%'
          },
          total: {
            show: true,
            label: 'Total',
            formatter: (w: any) => {
              const total = w.globals.seriesTotals?.reduce((a: number, b: number) => a + b, 0) || 0;
              return total.toString();
            }
          }
        }
      }
    },
    labels: [],
    colors: ['#28a745', '#FF3B30', '#0F172A']
  };

  // 3. Gráfico de Destinos más cotizados (Radar chart)
  destinationsRadarOptions: Partial<RadarChartOptions> = {
    series: [
      {
        name: 'Cotizaciones',
        data: []
      }
    ],
    chart: {
      height: 350,
      type: 'radar',
      toolbar: { show: false }
    },
    yaxis: {
      stepSize: 1
    },
    xaxis: {
      categories: []
    },
    colors: ['#FF3B30']
  };

  ngOnInit(): void {
    this.dashboardService.getStatistics().pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: response => {
        this.stats.set(response);
        this.buildCharts(response);
      },
      error: () => this.errorMessage.set('No se pudieron cargar las estadísticas.')
    });
  }

  ngAfterViewInit(): void {
    const apex = (window as any).ApexCharts;
    if (apex && typeof apex.setLicense === 'function') {
      apex.setLicense('APEX-eyJleHBpcnlEYXRlIjoiMjEyNi0wNy0wNCIsImlzc3VlRGF0ZSI6IjIwMjYtMDctMjgiLCJwbGFuIjoicHJlbWl1bSIsImRvbWFpbnMiOlsiYXBleGNoYXJ0cy5jb20iLCIxMjcuMC4wLjEiLCJsb2NhbGhvc3QiXSwic2lnIjoieVBmb1VCc0Z3TU9ZdUEyaEZkR0I2Y1FtZ0JITUtXcVdJSjB2NVRESXRZbFR3eDJMUmh6R2x0RUc3VXJ4X0s3b25ZMWRZb2Z2VGItN01ydFYyNDVyOWcifQ==');
    }
  }

  private buildCharts(data: DashboardStatsResponse): void {
    // 1. Usuarios: Line con gradient y categories
    if (data.registrations && data.registrations.length > 0) {
      const categories = data.registrations.map(r => r.label);
      const values = data.registrations.map(r => r.value);
      this.usersChartOptions = {
        ...this.usersChartOptions,
        series: [{ name: 'Usuarios registrados', data: values }],
        xaxis: { categories }
      };
    }

    // 2. Cotizaciones pagadas/pendientes: RadialBar
    if (data.statuses && data.statuses.length > 0) {
      const totalCount = data.statuses.reduce((acc, curr) => acc + curr.value, 0);
      const labels = data.statuses.map(s => {
        if (s.label.toLowerCase() === 'paid') return 'Pagadas';
        if (s.label.toLowerCase() === 'pending') return 'Pendientes';
        return s.label;
      });

      const seriesPercentages = data.statuses.map(s =>
        totalCount > 0 ? Math.round((s.value / totalCount) * 100) : 0
      );

      this.quotesRadialOptions = {
        ...this.quotesRadialOptions,
        series: seriesPercentages,
        labels,
        plotOptions: {
          radialBar: {
            dataLabels: {
              name: { fontSize: '20px' },
              value: {
                fontSize: '16px',
                formatter: (val: number) => Math.round(val) + '%'
              },
              total: {
                show: true,
                label: 'Total',
                formatter: () => totalCount.toString()
              }
            }
          }
        }
      };
    }

    // 3. Destinos: Radar chart
    if (data.destinations && data.destinations.length > 0) {
      const categories = data.destinations.map(d => d.label);
      const values = data.destinations.map(d => d.value);
      const maxVal = Math.max(...values, 5);

      this.destinationsRadarOptions = {
        ...this.destinationsRadarOptions,
        series: [{ name: 'Cotizaciones', data: values }],
        xaxis: { categories },
        yaxis: {
          stepSize: Math.max(1, Math.ceil(maxVal / 5))
        }
      };
    }
  }
}