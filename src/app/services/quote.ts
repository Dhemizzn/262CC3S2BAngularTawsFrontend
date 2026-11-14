import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { QuoteRequest } from '../model/request/quoteRequest';
import { QuoteResponse } from '../model/response/quoteResponse';
import { environment } from '../components/environments/environment';

export interface Destination {
  destinationId: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.url}/quotations`;

  getDestinations(): Observable<Destination[]> {
    return this.http.get<Destination[]>(`${this.apiUrl}/destinations`);
  }

  getMyPackages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-packages`);
  }

  cancelPackage(quotationId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${quotationId}`);
  }

  private _cotizaciones = signal<QuoteResponse[]>([]);
  cotizaciones = this._cotizaciones.asReadonly();

  private _confirmedQuote = signal<{ quotationId: string; proposal: QuoteResponse; } | null>(null);
  confirmedQuote = this._confirmedQuote.asReadonly();

  createQuote(request: QuoteRequest): Observable<QuoteResponse[]> {
    return this.http.post<QuoteResponse[]>(`${this.apiUrl}/generate`, request);
  }

  guardarCotizaciones(cotizaciones: QuoteResponse[]): void {
    this._cotizaciones.set(cotizaciones);
    this._confirmedQuote.set(null);
  }

  confirmQuote(cotizacion: QuoteResponse): Observable<{ quotationId: string; status: string; message: string; }> {
    return this.http.post<{ quotationId: string; status: string; message: string; }>(
      `${this.apiUrl}/confirm`, cotizacion
    ).pipe(
      tap(response => {
        this._confirmedQuote.set({ quotationId: response.quotationId, proposal: cotizacion });
      })
    );
  }

  createCheckout(quotationId: string): Observable<{ orderId: string; checkoutUrl: string; }> {
    return this.http.post<{ orderId: string; checkoutUrl: string; }>(
      `${environment.url}/payments/checkout`, { quotationId }
    );
  }

  verifyPayment(quotationId: string): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(
      `${environment.url}/payments/verify`, { quotationId }
    );
  }
}