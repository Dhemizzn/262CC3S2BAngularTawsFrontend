import { Component,inject } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [RouterLink, RouterModule, ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})

export class Login {
  location  = inject(Location);
  router = inject(Router);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  onBack() {
    this.location.back();
  }

  Login() {
    if(this.form.invalid){return;}
    const { email, password } = this.form.value;
    if (!email || !password) return;
    alert('Login successful');
    this.router.navigate(['/client-dashboard']);
  }
}
