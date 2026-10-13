import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-quotes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-quotes.html',
})
export class MyQuotes {
  // Datos simulados
  cotizaciones = [
    { id: 'COT-001', destino: 'Cusco, Perú', fechaPartida: '2026-11-15T08:00', estado: 'Pendiente' },
    { id: 'COT-002', destino: 'Puerta 5 ', fechaPartida: '2026-12-10T10:30', estado: 'Cotizada' },
    { id: 'COT-003', destino: 'SJL', fechaPartida: '2027-01-05T18:45', estado: 'Aceptada' }
  ];

  getEstadoClase(estado: string): string {
    switch(estado) {
      case 'Pendiente': return 'bg-warning text-dark';
      case 'Cotizada': return 'bg-info text-dark';
      case 'Aceptada': return 'bg-success';
      case 'Cancelada': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}