import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const sessionService = inject(SessionService);
  const authService = inject(Auth);
  const router = inject(Router);

  if (sessionService.isSessionValid()) {
    return true;
  }

  authService.logout();
  return router.createUrlTree(['/login']);
};