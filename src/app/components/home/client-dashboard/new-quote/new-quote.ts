import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-quote',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-quote.html',
})
export class NewQuote implements OnInit {
  fb = inject(FormBuilder);
  quoteForm!: FormGroup;
  successMessage: string = '';

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
      console.log('Payload a enviar:', this.quoteForm.value);
      this.successMessage = '¡Tu solicitud de cotización ha sido enviada al agente receptivo!';
      this.quoteForm.reset({ pasajeros: 1 });
      setTimeout(() => this.successMessage = '', 5000);
    } else {
      this.quoteForm.markAllAsTouched();
    }
  }
}