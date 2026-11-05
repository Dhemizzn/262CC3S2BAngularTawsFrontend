import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { Auth } from '../../../services/auth';
import { ToastService } from '../../../services/toast';

import { RegexConstants } from '../../../utils/regex-constants';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrl: './register.scss',
  imports: [
    RouterLink, 
    ReactiveFormsModule
  ]
})

export class Register {
  authService = inject(Auth);
  location = inject(Location);
  router = inject(Router);
  toastService = inject(ToastService);

  form = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastNameM: new FormControl('', [Validators.required]),
    lastNameP: new FormControl('', [Validators.required]),
    dni: new FormControl('', [
      Validators.required, 
      Validators.pattern(/^\d{8}$/)
    ]),
    phone: new FormControl('', [
      Validators.required, 
      Validators.pattern(/^\d{9}$/)
    ]),
    email: new FormControl('', [
      Validators.required, 
      Validators.email
    ]),
    direction: new FormControl('', [Validators.required]),
    roleId: new FormControl(2, [Validators.required])
  });

  filterInput(
    event: Event,
    field: 'firstName' | 'lastNameM' | 'lastNameP' | 'dni' | 'phone' | 'email' | 'direction',
    type: 'name' | 'number' | 'email' | 'address'
  ): void {
    RegexConstants[type](event);

    const input = event.target as HTMLInputElement;

    this.form.controls[field].setValue(input.value, {
      emitEvent: false
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      let mensajeAdvertencia = 'Por favor, complete todos los campos obligatorios.';

      if (this.form.controls.dni.errors?.['pattern']) {
        mensajeAdvertencia = 'El DNI debe tener exactamente 8 dígitos numéricos.';
      } else if (this.form.controls.phone.errors?.['pattern']) {
        mensajeAdvertencia = 'El teléfono debe tener exactamente 9 dígitos numéricos.';
      } else if (this.form.controls.email.errors?.['email']) {
        mensajeAdvertencia = 'Por favor, ingrese un correo electrónico válido.';
      }

      this.toastService.show(mensajeAdvertencia, 'warning');
      return;
    }

    const { 
      firstName, lastNameM, lastNameP, dni, phone, email, direction, roleId 
    } = this.form.value;

    if (!firstName || !lastNameM || !lastNameP || !dni || !phone || !email || !direction || !roleId) {
      return;
    }

    const registerRequest = {
      firstName: firstName,
      paternalSurname: lastNameP,
      maternalSurname: lastNameM,
      dni: dni,
      phone: phone,
      email: email,
      direction: direction,
      roleId: roleId
    };

    this.authService.register(registerRequest).subscribe({
      next: () => {
        this.toastService.show('¡Registro exitoso! Ya puedes iniciar sesión.', 'success');
        this.router.navigate(['/login']);
      },
      error: (error: HttpErrorResponse) => {
        const mensaje = error.error?.message || 'Error al registrar usuario';
        this.toastService.show(mensaje, 'danger');
      }
    });
  }
}