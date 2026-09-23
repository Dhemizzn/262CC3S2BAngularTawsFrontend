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
      imagen: 'https://images.pexels.com/photos/35697077/pexels-photo-35697077.jpeg?_gl=1*8g3dc4*_ga*MTAwODAxNDc4Mi4xNzkwMDQ0NzA1*_ga_8JE65Q40S6*czE3OTAwNDk1MjkkbzIkZzEkdDE3OTAwNDk1NDUkajQ0JGwwJGgw',
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
      imagen: 'https://images.unsplash.com/photo-1593494441374-bad54249d0e8?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',

    },
    {
      nombre: 'Machu Picchu clásico',
      duracion: '5 días',
      incluye: 'Cusco, tren y entrada a Machu Picchu.',
      precio: 'S/ 1 590',
      imagen: 'https://images.pexels.com/photos/5176713/pexels-photo-5176713.jpeg?_gl=1*158s5u3*_ga*MTAwODAxNDc4Mi4xNzkwMDQ0NzA1*_ga_8JE65Q40S6*czE3OTAwNDQ3MDQkbzEkZzEkdDE3OTAwNDUwOTkkajU5JGwwJGgw',
    },
    {
      nombre: 'Sur andino',
      duracion: '7 días',
      incluye: 'Arequipa, Colca, Puno y Titicaca.',
      precio: 'S/ 2 190',
      imagen: 'https://images.unsplash.com/photo-1620417396507-9a57523d16a6?q=80&w=2831&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
  ];

  readonly motivos = [
    {
      titulo: 'Guías locales',
      texto: 'Quiénes conocen la ruta, la historia y el ritmo de cada destino.',
      icono: 'bi-geo-alt',
    },
    {
      titulo: 'Grupos pequeños',
      texto: 'Salidas reducidas para que el viaje se sienta cercano, no masivo.',
      icono: 'bi-people',
    },
    {
      titulo: 'Precios claros',
      texto: 'Ves qué incluye cada plan antes de decidir. Sin letras chicas.',
      icono: 'bi-tag',
    },
    {
      titulo: 'Acompañamiento',
      texto: 'Soporte antes y durante el viaje para imprevistos en ruta.',
      icono: 'bi-headset',
    },
  ];
}
