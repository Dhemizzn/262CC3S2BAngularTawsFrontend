import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, Service } from '@angular/core';


@Service()
export class StorageService {
  private platformId = inject(PLATFORM_ID);

  getItem(key: string): string | null { //Permite obtener un item del localStorage, si no esta en un entorno de navegador, devuelve null
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(key);
    }
    return null;
  }

  setItem(key: string, value: string): void { //Setea un item en el localStorage, si no esta en un entorno de navegador, no hace nada
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, value);
    }
  }

  removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {//Elimina un item del localStorage, si no esta en un entorno de navegador, no hace nada
      localStorage.removeItem(key);
    }
  }

  clear(): void {
    if (isPlatformBrowser(this.platformId)) {//Limpia el localStorage, si no esta en un entorno de navegador, no hace nada
      localStorage.clear();
    }
  }
    


}
