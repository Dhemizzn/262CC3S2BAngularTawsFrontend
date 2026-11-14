import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { QuoteService } from '../services/quote';

export const quoteStepGuard: CanActivateFn = (route) => {

  const quoteService = inject(QuoteService);
  const router = inject(Router);

  const step = route.routeConfig?.path;
  const base = '/dashboard/nueva-cotizacion';

  if (quoteService.confirmedQuote() && step !== 'pagar') {
    return router.createUrlTree([base, 'pagar']);
  }

  if (step === 'cotizaciones' && !quoteService.cotizaciones().length) {
    return router.createUrlTree([base, 'nueva']);
  }

  if (step === 'pagar' && !quoteService.confirmedQuote()) {
    return router.createUrlTree([
      base,
      quoteService.cotizaciones().length ? 'cotizaciones' : 'nueva'
    ]);
  }

  return true;
};
