import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SessionService } from '../../../services/session';

export interface MenuItem {
  moduleName: string;
  urlPath: string;
  icon?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule],
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private router = inject(Router);
  private sessionService = inject(SessionService);

  firstName: string = 'Usuario';
  roleLabel: string = 'Portal del Socio';
  menuItems: MenuItem[] = [];

  ngOnInit(): void {
    const currentUser = this.sessionService.getUserSession();

    if (currentUser) {
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
        moduleName: 'Mis Paquetes',
        urlPath: '/dashboard/historial-paquetes',
        icon: 'bi-suitcase'
      });
    }
  }


  isDashboardHome(): boolean {
  return this.router.url === '/dashboard';
  }

  logout(): void {
    localStorage.removeItem('userToken');
    this.router.navigate(['/login']);
  }
}
