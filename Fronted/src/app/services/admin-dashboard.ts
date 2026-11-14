import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../components/environments/environment';
import { DashboardStatsResponse } from '../model/response/dashboardStatsResponse';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.url}/admin/dashboard`;

  getStatistics(): Observable<DashboardStatsResponse> {
    return this.http.get<DashboardStatsResponse>(this.apiUrl);
  }
}
