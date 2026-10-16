
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuoteRequest } from '../model/request/quoteRequest';
import { QuoteResponse } from '../model/response/quoteResponse';
import { environment } from '../components/environments/environment';

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.url}/quotations`

  private _cotizaciones = signal<QuoteResponse[]>([]);
  cotizaciones = this._cotizaciones.asReadonly();

  createQuote(request: QuoteRequest): Observable<QuoteResponse[]> {
    return this.http.post<QuoteResponse[]>(`${this.apiUrl}/generate`, request);
  }

  guardarCotizaciones(cotizaciones: QuoteResponse[]): void {
    this._cotizaciones.set(cotizaciones);
  }

  confirmQuote(cotizacion: QuoteResponse): Observable<{
      quotationId: string;
      status: string;
      message: string;
    }> {
      return this.http.post<{
        quotationId: string;
        status: string;
        message: string;
      }>(
        `${this.apiUrl}/confirm`,
        cotizacion
      );
}


}
