import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHighcharts } from 'highcharts-angular';

import { routes } from './app.routes';
import { loadingInterceptor } from './interceptors/loading-interceptor';
import { authInterceptor } from './interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, loadingInterceptor])
    ),
    provideHighcharts({
      instance: () =>
        import('highcharts/esm/highcharts').then(m => m.default),
      modules: () => [
        import('highcharts/esm/highcharts-more')
      ]
    })
  ]
};
