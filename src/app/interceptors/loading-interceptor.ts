import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { Loading } from '../services/loading';


export const loadingInterceptor: HttpInterceptorFn = (req, next) => {

  const loading = inject(Loading);

  loading.start();

  return next(req).pipe(//pipe() es un método que permite encadenar operadores de transformación y manejo de errores a un observable. En este caso, se utiliza para ejecutar la función finalize() cuando la solicitud HTTP se completa, ya sea con éxito o con error.
    finalize(() => loading.finish())//finalize() es un operador de RxJS que se ejecuta cuando el observable se completa o se produce un error. En este caso, se utiliza para llamar a la función finish() del servicio Loading, lo que indica que la solicitud HTTP ha finalizado y se puede ocultar el indicador de carga.
  );

};