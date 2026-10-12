import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { ClientDashboard } from './components/home/client-dashboard/client-dashboard';
import { Login } from './components/auth/login/login';
import { Recovery } from './components/auth/recovery/recovery';
import { Register } from './components/auth/register/register';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component:Register},
  { path: 'recovery', component:Recovery},
  { path: 'client-dashboard', component:ClientDashboard},
];

