import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { Auth } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { SessionService } from '../../../services/session';

import { RegexConstants } from '../../../utils/regex-constants';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
  imports: [
    RouterLink, 
    RouterModule, 
    ReactiveFormsModule
  ]
})
export class Login {
  // Inyección de dependencias
  location = inject(Location);
  router = inject(Router);
  authService = inject(Auth);
  toastService = inject(ToastService);
  sessionService = inject(SessionService);

  form = new FormGroup({
    email: new FormControl('', [
      Validators.required, 
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required, 
      Validators.minLength(6)
    ]),
  });

  filterEmail(event: Event): void {
    RegexConstants.email(event);

    const input = event.target as HTMLInputElement;

    this.form.controls.email.setValue(input.value, {
      emitEvent: false
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      const correoInvalido = this.form.controls.email.invalid;
      const contraInvalida = this.form.controls.password.invalid;

      let mensajeAdvertencia = 'Revisa los campos del formulario.';

      if (correoInvalido && contraInvalida) {
        mensajeAdvertencia = 'El correo no es válido y la contraseña es muy corta.';
      } else if (correoInvalido) {
        mensajeAdvertencia = 'Por favor, ingresa un correo electrónico válido.';
      } else if (contraInvalida) {
        mensajeAdvertencia = 'La contraseña debe tener al menos 6 caracteres.';
      }

      this.toastService.show(mensajeAdvertencia, 'warning');
      return;
    }

    const { email, password } = this.form.value;

    if (!email || !password) {
      return;
    }

    const loginRequest = {
      username: email,
      password: password
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.authService.setToken(response.token);

        const user = this.sessionService.getUserSession();

        if (user?.rolId === 1) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/dashboard/nueva-cotizacion']);
        }
      },
      error: (err: HttpErrorResponse) => {
        const mensajeError = err.error?.message || 'Ingreso fallido';
        this.toastService.show(mensajeError, 'danger');
      }
    });
  }
}