import { Component,OnInit,inject } from '@angular/core';
import {Router,RouterModule} from '@angular/router';

@Component({
  imports: [],
  selector: 'app-client-dashboard',
  styleUrl: './client-dashboard.scss',
  templateUrl: './client-dashboard.html',
})
export class ClientDashboard {
  router = inject(Router);
  logout() {
    alert('Logout successful');
    this.router.navigate(['/login']);
  }
}
