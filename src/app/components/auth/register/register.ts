import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Auth } from '../../../services/auth';

@Component({
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-register',
  styleUrl: './register.scss',
  templateUrl: './register.html',
})
export class Register {
  authService = inject(Auth);
  location = inject(Location);
  router = inject(Router);

  form = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastNameM: new FormControl('', [Validators.required]),
    lastNameP: new FormControl('', [Validators.required]),
    dni: new FormControl('', [Validators.required, Validators.pattern(/^\d{8}$/)]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^\d{9}$/)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    direction: new FormControl('', [Validators.required]),
    roleId: new FormControl(2, [Validators.required])
  });

  onSubmit() {
    if (this.form.invalid) {
      alert("Ingrese todo los campos");//Marca todos los campos como tocados para mostrar los mensajes de error
      return;
    }

    const { firstName, lastNameM, lastNameP, dni, phone, email, direction, roleId } = this.form.value;
    if (!firstName || !lastNameM || !lastNameP || !dni || !phone || !email || !direction || !roleId) return;

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
      next: (response) => {
        alert('Registro exitoso');
        this.router.navigate(['/login']);
        return;
      },
      error: (error: HttpErrorResponse) => {
        const mensaje = error.error?.message || 'Error al registrar usuario';
        alert(mensaje);
      }
    });

  }
}
