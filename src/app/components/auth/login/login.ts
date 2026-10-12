import { Component,inject } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Auth } from '../../../services/auth';

@Component({
  imports: [RouterLink, RouterModule, ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})

export class Login {
  location  = inject(Location);
  router = inject(Router);
  authService = inject(Auth);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  onSubmit() {
    if(this.form.invalid){
      return;
    }

    const { email, password } = this.form.value;
    if (!email || !password) return;

    const loginRequest = {
      username: email,
      password: password
    };
    
    this.authService.login(loginRequest).subscribe({
      next: (response) => { //next es un callback que se ejecuta cuando la solicitud es exitosa
        this.authService.setToken(response.token);
        alert('Login successful');
        this.router.navigate(['/client-dashboard']);
      },
      error: (error: HttpErrorResponse) => {
        const mensaje = error.error?.message || 'Error al iniciar sesion';
        alert(mensaje);
      }
    });
  }
}
