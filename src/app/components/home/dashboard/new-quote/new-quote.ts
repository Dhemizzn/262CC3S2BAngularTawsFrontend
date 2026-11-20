
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { QuoteService, Destination } from '../../../../services/quote';
import { QuoteRequest } from '../../../../model/request/quoteRequest';
import { ToastService } from '../../../../services/toast';

import { RegexConstants } from '../../../../utils/regex-constants';

@Component({
  selector: 'app-new-quote',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-quote.html',
  styleUrl: './new-quote.scss'
})
export class NewQuote implements OnInit {
  private formBuilder = inject(FormBuilder);
  private quoteService = inject(QuoteService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  quoteForm!: FormGroup;

  destinations = signal<Destination[]>([]);
  loadingDestinations = signal(true);

  departureCities: string[] = [
    'Lima',
    'Arequipa',
    'Cusco',
    'Trujillo',
    'Chiclayo',
    'Piura'
  ];

  ngOnInit(): void {
    this.quoteForm = this.formBuilder.group({
      destination: ['', Validators.required],
      departureCity: ['', Validators.required],
      passengerCount: [1, [
        Validators.required,
        Validators.min(1),
        Validators.max(10)
      ]],
      departureDate: ['', Validators.required],
      returnDate: ['', Validators.required]
    });

    this.loadDestinations();
  }

  filterPassengerCount(event: Event): void {
    RegexConstants.number(event);

    const input = event.target as HTMLInputElement;

    this.quoteForm.get('passengerCount')?.setValue(
      input.value === '' ? null : Number(input.value),
      { emitEvent: false }
    );
  }

  loadDestinations(): void {
    this.quoteService.getDestinations().subscribe({
      next: (data) => {
        this.destinations.set(data);
        this.loadingDestinations.set(false);
      },
      error: () => {
        this.toastService.show(
          'No se pudieron cargar los destinos.',
          'danger'
        );
        this.loadingDestinations.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.quoteForm.invalid) {
      this.quoteForm.markAllAsTouched();

      const pasajeros = this.quoteForm.get('passengerCount');

      let mensajeAdvertencia =
        'Por favor, completa todos los campos obligatorios correctamente.';

      if (pasajeros?.hasError('required')) {
        mensajeAdvertencia = 'Debes ingresar la cantidad de pasajeros.';
      } else if (pasajeros?.hasError('min')) {
        mensajeAdvertencia = 'Debe haber al menos 1 pasajero.';
      } else if (pasajeros?.hasError('max')) {
        mensajeAdvertencia = 'La cantidad máxima permitida es de 10 pasajeros.';
      }

      this.toastService.show(mensajeAdvertencia, 'warning');
      return;
    }

    const formValue = this.quoteForm.value;

    const payload: QuoteRequest = {
      departureCity: formValue.departureCity,
      destination: formValue.destination,
      passengerCount: formValue.passengerCount,
      departureDate: formValue.departureDate,
      returnDate: formValue.returnDate
    };

    this.quoteService.createQuote(payload).subscribe({
      next: (response) => {
        this.quoteService.guardarCotizaciones(response);

        this.toastService.show(
          'Cotizaciones generadas con éxito.',
          'success'
        );

        this.router.navigate([
          '/dashboard/nueva-cotizacion/cotizaciones'
        ]);
      },
      error: (err) => {
        const errorMessage =
          err.error?.message || 'Error al generar cotizaciones.';

        this.toastService.show(errorMessage, 'danger');
      }
    });
  }
}
