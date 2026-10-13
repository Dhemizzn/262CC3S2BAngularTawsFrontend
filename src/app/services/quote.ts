import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuoteRequest } from '../model/request/quoteRequest';
import { QuoteResponse } from '../model/response/quoteResponse';
import { environment } from '../components/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  
  private apiUrl = `${environment.url}/quotes`;

  constructor(private http: HttpClient) { }

  createQuote(request: QuoteRequest): Observable<QuoteResponse> {
    return this.http.post<QuoteResponse>(this.apiUrl, request);
  }
}