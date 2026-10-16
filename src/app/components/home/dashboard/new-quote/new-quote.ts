import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { QuoteService } from '../../../../services/quote';
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

  ngOnInit(): void {
    this.quoteForm = this.fb.group({
      destino: ['', Validators.required],
      ciudadPartida: ['', Validators.required],
      pasajeros: [1, [Validators.required, Validators.min(1)]],
      fechaPartida: ['', Validators.required],
      fechaRetorno: ['', Validators.required]
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
        this.router.navigate(['/dashboard/mis-cotizaciones']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al generar cotizaciones';
      }
    });
  }
}