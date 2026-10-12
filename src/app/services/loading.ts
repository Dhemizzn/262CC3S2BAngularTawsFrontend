import { computed, Service, signal } from '@angular/core';

@Service()
export class Loading {

  private readonly pendingRequests = signal(0);//La interfaz reacciona automaticamente a los cambios en esta señal, lo que permite mostrar u ocultar un indicador de carga según el estado de las solicitudes pendientes.

  readonly isLoading = computed(//La propiedad isLoading es una señal computada que devuelve true si hay solicitudes pendientes (pendingRequests > 0) y false en caso contrario. Esto permite a la interfaz de usuario reaccionar automáticamente a los cambios en el estado de carga.  
    () => this.pendingRequests() > 0 //computed es una función que crea una señal computada basada en otras señales. En este caso, isLoading se calcula a partir de pendingRequests. Cuando pendingRequests cambia, isLoading se recalcula automáticamente. 
  );

  start(): void { //La función start() se llama cuando se inicia una solicitud HTTP. Incrementa el contador de solicitudes pendientes en 1. Esto indica que hay una nueva solicitud en curso y, por lo tanto, la interfaz de usuario puede mostrar un indicador de carga.
    this.pendingRequests.update(count => count + 1);
  }

  finish(): void {//La función finish() se llama cuando se completa una solicitud HTTP. Decrementa el contador de solicitudes pendientes en 1, asegurándose de que no sea negativo. Esto indica que una solicitud ha finalizado y, si no hay más solicitudes pendientes, la interfaz de usuario puede ocultar el indicador de carga.
    this.pendingRequests.update(count => Math.max(0, count - 1));
  }

}
