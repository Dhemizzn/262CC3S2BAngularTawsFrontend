
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
    firstName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(40)
    ]),
    lastNameM: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(40)
    ]),
    lastNameP: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(40)
    ]),
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
      Validators.email,
      Validators.maxLength(40)
    ]),
    direction: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(150)
    ]),
    roleId: new FormControl(2, [
      Validators.required
    ])
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

      const c = this.form.controls;
      let mensajeAdvertencia = 'Revisa los campos del formulario.';

      if (Object.values(c).some(control => control.hasError('required'))) {
        mensajeAdvertencia = 'Por favor, completa todos los campos obligatorios.';
      } else if (c.firstName.invalid) {
        mensajeAdvertencia = 'El nombre debe tener entre 2 y 40 caracteres.';
      } else if (c.lastNameP.invalid) {
        mensajeAdvertencia = 'El apellido paterno debe tener entre 2 y 40 caracteres.';
      } else if (c.lastNameM.invalid) {
        mensajeAdvertencia = 'El apellido materno debe tener entre 2 y 40 caracteres.';
      } else if (c.dni.hasError('pattern')) {
        mensajeAdvertencia = 'El DNI debe tener exactamente 8 dígitos numéricos.';
      } else if (c.email.hasError('maxlength')) {
        mensajeAdvertencia = 'El correo no debe superar los 40 caracteres.';
      } else if (c.email.hasError('email')) {
        mensajeAdvertencia = 'Por favor, ingresa un correo electrónico válido.';
      } else if (c.phone.hasError('pattern')) {
        mensajeAdvertencia = 'El teléfono debe tener exactamente 9 dígitos numéricos.';
      } else if (c.direction.invalid) {
        mensajeAdvertencia = 'La dirección debe tener entre 5 y 150 caracteres.';
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
      firstName: firstName.trim(),
      paternalSurname: lastNameP.trim(),
      maternalSurname: lastNameM.trim(),
      dni: dni,
      phone: phone,
      email: email.trim(),
      direction: direction.trim(),
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

  focusNextField(event: Event): void {
    event.preventDefault();

    const input = event.target as HTMLInputElement;
    const inputs = Array.from(
      input.form?.querySelectorAll<HTMLInputElement>(
        'input:not([disabled]), button[type="submit"]'
      ) ?? []
    );

    const currentIndex = inputs.indexOf(input);

    if (currentIndex !== -1 && currentIndex < inputs.length - 1) {
      inputs[currentIndex + 1].focus();
    }
  }
}
