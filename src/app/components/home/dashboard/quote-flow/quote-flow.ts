import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuoteService } from '../../../../services/quote';

@Component({
  selector: 'app-quote-flow',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './quote-flow.html',
  styleUrl: './quote-flow.scss'
})
export class QuoteFlow {

  private quoteService = inject(QuoteService);

  steps = [
    { path: 'nueva', label: 'Nueva Cotización' },
    { path: 'cotizaciones', label: 'Mis Cotizaciones' },
    { path: 'pagar', label: 'Pagar' }
  ];

  currentUnlocked(): number {
    if (this.quoteService.confirmedQuote()) {
      return 2;
    }

    if (this.quoteService.cotizaciones().length > 0) {
      return 1;
    }

    return 0;
  }

  canOpen(index: number): boolean {
    return index <= this.currentUnlocked();
  }
}
