
import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Dashboard } from './components/home/dashboard/dashboard';
import { Login } from './components/auth/login/login';
import { Recovery } from './components/auth/recovery/recovery';
import { Register } from './components/auth/register/register';
import { NewQuote } from './components/home/dashboard/new-quote/new-quote';
import { MyQuotes } from './components/home/dashboard/my-quotes/my-quotes';
import { PackageHistory } from './components/home/dashboard/package-history/package-history';
import { Roles } from './components/home/dashboard/roles/roles';
import { authGuard } from './guards/auth-guard';
import { moduleGuard } from './guards/module-guard';
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'recovery', component: Recovery },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    children: [
      {
        path: 'nueva-cotizacion',
        component: NewQuote,
        canActivate: [authGuard, moduleGuard]
      },
      {
        path: 'mis-cotizaciones',
        component: MyQuotes,
        canActivate: [authGuard, moduleGuard]
      },
      {
        path: 'mis-pagos',
        redirectTo: 'mis-cotizaciones',
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
      },
      {
        path: '',
        redirectTo: 'nueva-cotizacion',
        pathMatch: 'full'
      }
    ]
  }
];
