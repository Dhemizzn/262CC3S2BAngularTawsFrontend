
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ToastService } from '../../../services/toast';
import { RegexConstants } from '../../../utils/regex-constants';

@Component({
  selector: 'app-recovery',
  templateUrl: './recovery.html',
  styleUrl: './recovery.scss',
  imports: [
    RouterLink,
    ReactiveFormsModule
  ]
})
export class Recovery {
  toastService = inject(ToastService);

  form = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.maxLength(40)
    ])
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

      const email = this.form.controls.email;
      let mensajeAdvertencia = 'Revisa los campos del formulario.';

      if (email.hasError('required')) {
        mensajeAdvertencia = 'Debes ingresar tu correo electrónico.';
      } else if (email.hasError('maxlength')) {
        mensajeAdvertencia = 'El correo no debe superar los 40 caracteres.';
      } else if (email.hasError('email')) {
        mensajeAdvertencia = 'Por favor, ingresa un correo electrónico válido.';
      }

      this.toastService.show(mensajeAdvertencia, 'warning');
      return;
    }

    const email = this.form.controls.email.value;

    if (!email) {
      return;
    }

    this.toastService.show(
      'El formulario es válido, pero falta conectar el servicio de recuperación.',
      'warning'
    );
  }
}
