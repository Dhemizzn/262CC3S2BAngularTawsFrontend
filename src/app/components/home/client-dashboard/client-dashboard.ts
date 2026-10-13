import { Component,OnInit,inject } from '@angular/core';
import {Router,RouterModule} from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  selector: 'app-client-dashboard',
  styleUrl: './client-dashboard.scss',
  templateUrl: './client-dashboard.html',
})
export class ClientDashboard implements OnInit {
  router = inject(Router);
  fb = inject(FormBuilder);

  quoteForm!: FormGroup;
  successMessage: string = '';

  ngOnInit(): void {
    this.quoteForm = this.fb.group({
      destino: ['', Validators.required],
      pasajeros: [1, [Validators.required, Validators.min(1)]],
      fechaPartida: ['', Validators.required],
      fechaRetorno: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.quoteForm.valid) {
      console.log('Payload a enviar:', this.quoteForm.value);
      
      this.successMessage = '¡Tu solicitud de cotización ha sido registrada con éxito!';
      
      this.quoteForm.reset({ pasajeros: 1 });
      
      setTimeout(() => this.successMessage = '', 5000);
    } else {
      this.quoteForm.markAllAsTouched();
    }
  }

  logout() {
    alert('Logout successful');
    this.router.navigate(['/login']);
  }
}
