import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [RouterModule],
  styleUrl: './client-dashboard.scss',
  templateUrl: './client-dashboard.html',
})
export class ClientDashboard {
  router = inject(Router);

  logout() {
    this.router.navigate(['/login']);
  }
}