import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Auth } from '../../../services/auth';
import { ToastService } from '../../../services/toast';

@Component({
  standalone: true,
  imports: [RouterLink, RouterModule, ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  location = inject(Location);
  router = inject(Router);
  authService = inject(Auth);
  toastService = inject(ToastService);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.show('El correo debe ser válido y la contraseña tener al menos 6 caracteres.', 'warning');
      return;
    }

    const { email, password } = this.form.value;
    if (!email || !password) return;

    const loginRequest = {
      username: email,
      password: password
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.authService.setToken(response.token);
        
        this.toastService.show('Inicio de sesión exitoso.', 'success');
        
        this.router.navigate(['/client-dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        const mensajeError = err.error?.message || 'Ingreso fallido';
        this.toastService.show(mensajeError, 'danger');
      }
    });
  }
}