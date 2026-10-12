import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../components/environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {//req es un objeto que representa la solicitud HTTP entrante, y next es una función que se llama para pasar la solicitud al siguiente interceptor en la cadena o al backend si no hay más interceptores.

  const apiUrl = environment.url.replace(/\/$/, '');

  // Verificar que la peticion pertenece al backend TAWS
  const isOurApi = req.url === apiUrl || req.url.startsWith(`${apiUrl}/`);

  if (!isOurApi) {
    return next(req);
  }

  // Rutas publicas que no necesitan JWT
  const publicRoutes = ['/auth/login', '/auth/register'];

  const isPublic = publicRoutes.some( //comprueba si al menos un elemento del arreglo cumple una condición.
    route => req.url.split('?')[0] === `${apiUrl}${route}` //separa la URL de los parametros de consulta, y devuleve true si la ruta coincide con alguna de las rutas publicas, y false en caso contrario.
  );

  if (isPublic) {//si la ruta es publica, no se agrega el JWT a la cabecera Authorization
    return next(req);
  }

  // Obtener JWT guardado durante el login
  const token = localStorage.getItem('user_token');

  if (!token) {//si no hay token, se envia la peticion sin el JWT
    return next(req);//esta función es la que se encarga de enviar la petición HTTP al siguiente interceptor o al backend, dependiendo de si hay más interceptores configurados o no.
  }

  // Agregar el JWT a la cabecera Authorization
  const authenticatedRequest = req.clone({
    setHeaders: { //setHeaders es una propiedad del objeto de configuración que permite establecer encabezados HTTP personalizados para la solicitud. En este caso, se está agregando un encabezado Authorization con el valor Bearer seguido del token JWT.
      Authorization: `Bearer ${token}`
    }
  });
  return next(authenticatedRequest);
};