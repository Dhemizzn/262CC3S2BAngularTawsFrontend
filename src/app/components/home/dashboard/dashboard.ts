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

  private iconMap: { [key: string]: string } = {
    '/historial-paquetes': 'bi-archive',
    'historial-paquetes': 'bi-archive',
    '/nueva-cotizacion': 'bi-file-earmark-plus',
    'nueva-cotizacion': 'bi-file-earmark-plus',
    '/mis-cotizaciones': 'bi-card-list',
    'mis-cotizaciones': 'bi-card-list',
    '/mis-pagos': 'bi-credit-card',
    'mis-pagos': 'bi-credit-card',
    '/usuarios': 'bi-people',
    'usuarios': 'bi-people',
    '/roles': 'bi-shield-lock',
    'roles': 'bi-shield-lock'
  };

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

    this.roleLabel = (idRol === 1) ? 'Panel Administrativo' : 'Portal del Socio';

    if (user.modules && user.modules.length > 0) {
      this.menuItems = user.modules.map((mod: any) => ({
        moduleName: mod.moduleName || mod.module_name,
        urlPath: mod.urlPath || mod.url_path,
        icon: this.iconMap[mod.urlPath || mod.url_path] || 'bi-folder'
      }));
    } else {
      this.menuItems = [];
    }
  }

  logout(): void {
    localStorage.removeItem('userToken');
    this.router.navigate(['/login']);
  }
}