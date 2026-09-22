import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';


@Component({
  imports: [RouterLink],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {
  readonly destinos = [
    {
      nombre: 'Machu Picchu',
      region: 'Cusco',
      descripcion: 'La ciudadela inca y uno de los destinos más visitados del Perú.',
      imagen: 'https://images.pexels.com/photos/259967/pexels-photo-259967.jpeg',
    },
    {
      nombre: 'Valle del Colca',
      region: 'Arequipa',
      descripcion: 'Cañones, pueblos andinos y el vuelo del cóndor.',
      imagen: 'https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg',
    },
    {
      nombre: 'Lago Titicaca',
      region: 'Puno',
      descripcion: 'Islas, cultura viva y el lago navegable más alto del mundo.',
      imagen: 'https://images.pexels.com/photos/208701/pexels-photo-208701.jpeg',
    },
    {
      nombre: 'Selva amazónica',
      region: 'Loreto',
      descripcion: 'Ríos, biodiversidad y lodges en la selva peruana.',
      imagen: 'https://images.pexels.com/photos/2739664/pexels-photo-2739664.jpeg',
    },
  ];

  readonly planes = [
    {
      nombre: 'Cusco esencial',
      duracion: '3 días',
      incluye: 'City tour, Valle Sagrado y traslados.',
      precio: 'S/ 890',
    },
    {
      nombre: 'Machu Picchu clásico',
      duracion: '5 días',
      incluye: 'Cusco, tren y entrada a Machu Picchu.',
      precio: 'S/ 1 590',
    },
    {
      nombre: 'Sur andino',
      duracion: '7 días',
      incluye: 'Arequipa, Colca, Puno y Titicaca.',
      precio: 'S/ 2 190',
    },
  ];

  readonly tarifas = [
    {
      nombre: 'Básico',
      precio: 'S/ 890',
      detalle: 'Hospedaje turístico, desayunos y un tour diario.',
    },
    {
      nombre: 'Recomendado',
      precio: 'S/ 1 590',
      detalle: 'Hotel 3 estrellas, tren y entradas principales.',
    },
    {
      nombre: 'Premium',
      precio: 'S/ 2 490',
      detalle: 'Hotel 4 estrellas, guía privado y experiencias extra.',
    },
  ];

  readonly motivos = [
    {
      titulo: 'Guías locales',
      texto: 'Quiénes conocen la ruta, la historia y el ritmo de cada destino.',
    },
    {
      titulo: 'Grupos pequeños',
      texto: 'Salidas reducidas para que el viaje se sienta cercano, no masivo.',
    },
    {
      titulo: 'Precios claros',
      texto: 'Ves qué incluye cada plan antes de decidir. Sin letras chicas.',
    },
    {
      titulo: 'Acompañamiento',
      texto: 'Soporte antes y durante el viaje para imprevistos en ruta.',
    },
  ];
}
