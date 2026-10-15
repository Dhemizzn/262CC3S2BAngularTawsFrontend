import { Injectable, Service, inject } from '@angular/core';
import { StorageService } from './storage';
import { user } from '../model/user';

@Service()
export class SessionService {
  private storageService = inject(StorageService);

    getUserSession(): user | null {
    const decoded = this.getDecodedToken();

    if (!decoded) return null;

    return {
        email: decoded.email,
        personId: decoded.personId,
        names: decoded.names,
        rolId: decoded.rolId,
        modules: decoded.modules
    };
    }

  private getDecodedToken(): any | null {
    const token = this.storageService.getItem('userToken');

    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      if (!payload) return null;

      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
}