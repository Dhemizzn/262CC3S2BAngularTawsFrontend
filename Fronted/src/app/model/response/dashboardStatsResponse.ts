export interface ChartItem {
  label: string;
  value: number;
}

export interface DashboardStatsResponse {
  destinations: ChartItem[];
  statuses: ChartItem[];
  registrations: ChartItem[];
}
