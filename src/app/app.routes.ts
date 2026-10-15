import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Dashboard } from './components/home/dashboard/dashboard';
import { Login } from './components/auth/login/login';
import { Recovery } from './components/auth/recovery/recovery';
import { Register } from './components/auth/register/register';
import { NewQuote } from './components/home/dashboard/new-quote/new-quote';
import { MyQuotes } from './components/home/dashboard/my-quotes/my-quotes';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component:Register},
  { path: 'recovery', component:Recovery},
  { 
    path: 'dashboard', 
    component: Dashboard, 
    children: [
      { path: 'nueva-cotizacion', component: NewQuote },
      { path: 'mis-cotizaciones', component: MyQuotes },
      { path: '', redirectTo: 'nueva-cotizacion', pathMatch: 'full' }
    ]
  },
];

