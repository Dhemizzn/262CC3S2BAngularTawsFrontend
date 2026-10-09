import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Recovery } from './auth/recovery/recovery';
import { ClientDashboard } from './client-dashboard/client-dashboard';
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component:Register},
  { path: 'recovery', component:Recovery},
  { path: 'client-dashboard', component:ClientDashboard},
];

