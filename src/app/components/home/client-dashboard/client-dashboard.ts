import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SessionService } from '../../../services/session';
import { StorageService } from '../../../services/storage'; 

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [RouterModule],
  styleUrl: './client-dashboard.scss',
  templateUrl: './client-dashboard.html',
})
export class ClientDashboard implements OnInit {
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private storageService = inject(StorageService);

  firstName: string = 'Socio'; 

  ngOnInit(): void {
    const currentUser = this.sessionService.getUserSession(); 
    
    if (currentUser && currentUser.names) {
      this.firstName = currentUser.names.split(' ')[0];
    }
  }

  logout() {
    localStorage.removeItem('userToken'); 
    this.router.navigate(['/login']);
  }
}