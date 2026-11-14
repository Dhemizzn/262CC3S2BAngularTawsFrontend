import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Dashboard } from './components/home/dashboard/dashboard';
import { Login } from './components/auth/login/login';
import { Recovery } from './components/auth/recovery/recovery';
import { Register } from './components/auth/register/register';
import { NewQuote } from './components/home/dashboard/new-quote/new-quote';
import { MyQuotes } from './components/home/dashboard/my-quotes/my-quotes';
import { QuoteFlow } from './components/home/dashboard/quote-flow/quote-flow';
import { QuotePayment } from './components/home/dashboard/quote-payment/quote-payment';
import { PackageHistory } from './components/home/dashboard/package-history/package-history';
import { Roles } from './components/home/dashboard/roles/roles';
import { authGuard } from './guards/auth-guard';
import { moduleGuard } from './guards/module-guard';
import { quoteStepGuard } from './guards/quote-step-guard';
import { guestGuard } from './guards/guest-guard';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    component: Register,
    canActivate: [guestGuard]
  },
  {
    path: 'recovery',
    component: Recovery,
    canActivate: [guestGuard]
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    children: [
      {
        path: 'nueva-cotizacion',
        component: QuoteFlow,
        canActivate: [moduleGuard],
        children: [
          {
            path: 'nueva',
            component: NewQuote,
            canActivate: [quoteStepGuard]
          },
          {
            path: 'cotizaciones',
            component: MyQuotes,
            canActivate: [quoteStepGuard]
          },
          {
            path: 'pagar',
            component: QuotePayment,
            canActivate: [quoteStepGuard]
          },
          {
            path: '',
            redirectTo: 'nueva',
            pathMatch: 'full'
          }
        ]
      },
      {
        path: 'mis-cotizaciones',
        redirectTo: 'nueva-cotizacion/cotizaciones',
        pathMatch: 'full'
      },
      {
        path: 'mis-pagos',
        redirectTo: 'nueva-cotizacion/pagar',
        pathMatch: 'full'
      },
      {
        path: 'historial-paquetes',
        component: PackageHistory,
        canActivate: [authGuard, moduleGuard]
      },
      {
        path: 'roles',
        component: Roles,
        canActivate: [authGuard, moduleGuard]
      }
    ]
  }
];
