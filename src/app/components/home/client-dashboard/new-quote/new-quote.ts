import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  quoteForm!: FormGroup;
  successMessage: string = '';
  errorMessage: string = ''; 

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
    if (this.quoteForm.valid) {
      const formValue = this.quoteForm.value;

      const payload: QuoteRequest = {
        departureCity: formValue.ciudadPartida,
        destination: formValue.destino,
        passengerCount: formValue.pasajeros,
        departureDate: formValue.fechaPartida.includes('T') ? formValue.fechaPartida : `${formValue.fechaPartida}T08:00:00`,
        returnDate: formValue.fechaRetorno.includes('T') ? formValue.fechaRetorno : `${formValue.fechaRetorno}T18:00:00`
      };

      console.log('Enviando al backend:', payload);

      this.quoteService.createQuote(payload).subscribe({
        next: (response) => {
          console.log('Respuesta del backend:', response);
          this.successMessage = response.message || '¡Tu solicitud de cotización ha sido enviada al agente receptivo!';
          this.errorMessage = '';
          this.quoteForm.reset({ pasajeros: 1 });
          
          setTimeout(() => this.successMessage = '', 5000);
        },
        error: (err) => {
          console.error('Error al enviar la solicitud:', err);
          this.errorMessage = 'Hubo un error al conectar con el servidor. Inténtalo de nuevo.';
          setTimeout(() => this.errorMessage = '', 5000);
        }
      });

    } else {
      this.quoteForm.markAllAsTouched();
    }
  }
}