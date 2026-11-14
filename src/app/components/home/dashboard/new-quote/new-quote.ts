import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { QuoteService, Destination } from '../../../../services/quote';
import { QuoteRequest } from '../../../../model/request/quoteRequest';

@Component({
  selector: 'app-new-quote',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-quote.html',
})
export class NewQuote implements OnInit {
  private fb = inject(FormBuilder);
  private quoteService = inject(QuoteService);
  private router = inject(Router);

  quoteForm!: FormGroup;
  successMessage = '';
  errorMessage = '';

  destinos = signal<Destination[]>([]);
  cargandoDestinos = signal(true);
  ciudadesPartida: string[] = ['Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Chiclayo', 'Piura'];

  ngOnInit(): void {
    this.quoteForm = this.fb.group({
      destino: ['', Validators.required],
      ciudadPartida: ['', Validators.required],
      pasajeros: [1, [Validators.required, Validators.min(1)]],
      fechaPartida: ['', Validators.required],
      fechaRetorno: ['', Validators.required]
    });

    this.cargarDestinos();
  }

  cargarDestinos(): void {
    this.quoteService.getDestinations().subscribe({
      next: (data) => {
        this.destinos.set(data);
        this.cargandoDestinos.set(false);
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los destinos.';
        this.cargandoDestinos.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.quoteForm.invalid) {
      this.quoteForm.markAllAsTouched();
      return;
    }

    const formValue = this.quoteForm.value;

    const payload: QuoteRequest = {
      departureCity: formValue.ciudadPartida,
      destination: formValue.destino,
      passengerCount: formValue.pasajeros,
      departureDate: formValue.fechaPartida,
      returnDate: formValue.fechaRetorno
    };

    this.quoteService.createQuote(payload).subscribe({
      next: (response) => {
        this.quoteService.guardarCotizaciones(response);
        this.router.navigate(['/dashboard/nueva-cotizacion/cotizaciones']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al generar cotizaciones';
      }
    });
  }
}