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
  firstName: string = 'Socio';

  ngOnInit(): void {
    const userSession = localStorage.getItem('user'); 
    if (userSession) {
      try {
        const user = JSON.parse(userSession);
        this.firstName = user.firstName || user.nombre || 'Socio';
      } catch (e) {
        console.error('Error al obtener datos del usuario', e);
      }
    }
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}