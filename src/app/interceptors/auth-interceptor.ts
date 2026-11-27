import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../components/environments/environment';
import { StorageService } from '../services/storage';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const apiUrl = environment.url.replace(/\/$/, '');
  const storageService = inject(StorageService);
  const isOurApi = req.url === apiUrl || req.url.startsWith(`${apiUrl}/`);

  if (!isOurApi) {
    return next(req);
  }

  const publicRoutes = ['/auth/login', '/auth/register'];

  const isPublic = publicRoutes.some( //comprueba si al menos un elemento del arreglo cumple una condición.
    route => req.url.split('?')[0] === `${apiUrl}${route}` //separa la URL de los parametros de consulta, y devuleve true si la ruta coincide con alguna de las rutas publicas, y false en caso contrario.
  );

  if (isPublic) {//si la ruta es publica, no se agrega el JWT a la cabecera Authorization
    return next(req);
  }

  const token = storageService.getItem('userToken'); //obtiene el token JWT del localStorage, si no esta en un entorno de navegador, devuelve null

  if (!token) {
    return next(req);//esta función es la que se encarga de enviar la petición HTTP al siguiente interceptor o al backend, dependiendo de si hay más interceptores configurados o no.
  }

  const authenticatedRequest = req.clone({
    setHeaders: { //setHeaders es una propiedad del objeto de configuración que permite establecer encabezados HTTP personalizados para la solicitud. En este caso, se está agregando un encabezado Authorization con el valor Bearer seguido del token JWT.
      Authorization: `Bearer ${token}`
    }
  });
  return next(authenticatedRequest);
};