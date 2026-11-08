import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SessionService } from '../../../services/session';
import { Auth } from '../../../services/auth';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';


export interface MenuItem {
  moduleName: string;
  urlPath: string;
  icon?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, AdminDashboard],
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private authService = inject(Auth);
  private router = inject(Router);
  private sessionService = inject(SessionService);
  isAdmin = false;

  firstName: string = 'Usuario';
  roleLabel: string = 'Portal del Socio';
  menuItems: MenuItem[] = [];

  ngOnInit(): void {
    const currentUser = this.sessionService.getUserSession();

    if (currentUser) {
      this.isAdmin = Number(currentUser.rolId) === 1;

      if (currentUser.names) {
        this.firstName = currentUser.names.split(' ')[0];
      }

      this.loadDynamicMenu(currentUser);
    }
  }


  private loadDynamicMenu(user: any): void {
    const idRol = Number(user.rolId);

    this.roleLabel = idRol === 1
      ? 'Panel Administrativo'
      : 'Portal del Socio';

    const modules = Array.isArray(user.modules)
      ? user.modules
      : [];

    const paths = modules.map((mod: any) =>
      String(mod.urlPath || mod.url_path || '')
        .replace(/^\/+/, '')
    );

    this.menuItems = [
      {
        moduleName: 'Dashboard',
        urlPath: '/dashboard',
        icon: 'bi-grid'
      }
    ];

    if (paths.includes('nueva-cotizacion')) {
      this.menuItems.push({
        moduleName: 'Nueva Cotización',
        urlPath: '/dashboard/nueva-cotizacion',
        icon: 'bi-file-earmark-plus'
      });
    }

    if (paths.includes('historial-paquetes')) {
      this.menuItems.push({
        moduleName: idRol === 1 ? 'Historial de Paquetes' : 'Mis Paquetes',
        urlPath: '/dashboard/historial-paquetes',
        icon: 'bi-clock-history'
      });
    }
  }


  isDashboardHome(): boolean {
  return this.router.url === '/dashboard';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
