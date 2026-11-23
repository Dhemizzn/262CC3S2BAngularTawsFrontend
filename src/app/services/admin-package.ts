import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../components/environments/environment';
import { AdminPackage, AdminPackageFilter } from '../model/admin-package';

@Injectable({
  providedIn: 'root'
})
export class AdminPackageService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.url}/admin/packages`;

  getPackages(filters?: AdminPackageFilter): Observable<AdminPackage[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
      if (filters.minAmount !== undefined && filters.minAmount !== null) {
        params = params.set('minAmount', filters.minAmount.toString());
      }
      if (filters.maxAmount !== undefined && filters.maxAmount !== null) {
        params = params.set('maxAmount', filters.maxAmount.toString());
      }
      if (filters.userId !== undefined && filters.userId !== null) {
        params = params.set('userId', filters.userId.toString());
      }
      if (filters.quotationId && filters.quotationId.trim()) {
        params = params.set('quotationId', filters.quotationId.trim());
      }
      if (filters.status && filters.status.trim()) {
        params = params.set('status', filters.status.trim());
      }
    }

    return this.http.get<AdminPackage[]>(this.apiUrl, { params });
  }
}
