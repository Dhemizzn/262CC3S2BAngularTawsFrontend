
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session';

export const moduleGuard: CanActivateFn = (route) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  const user = sessionService.getUserSession();

  if (!sessionService.isSessionValid() || !user) {
    return router.createUrlTree(['/login']);
  }

  const requestedPath = route.routeConfig?.path;

  if (!requestedPath || !Array.isArray(user.modules)) {
    return router.createUrlTree(['/']);
  }

  const hasPermission = user.modules.some(
    module => module.urlPath === requestedPath
  );

  if (hasPermission) {
    return true;
  }

  return router.createUrlTree(['/']);
};
