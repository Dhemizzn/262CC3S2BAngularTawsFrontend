import { Service, signal } from '@angular/core';
import { authResponse } from '../model/response/authResponse';
import { user } from '../model/user';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

@Service()
export class Auth {
    private  isAuthenticated = signal<boolean>(this.hasToken());
    isAuthenticated$ = this.isAuthenticated.asReadonly();

    http = inject(HttpClient);
    login(authRequest: user) : Observable<authResponse> {
        return this.http.post<authResponse>('/api/login', authRequest);
    }

    register(registerRequest: user) : Observable<authResponse> {
        return this.http.post<authResponse>('/api/register', registerRequest);
    }

    private hasToken(): boolean {
        return !!localStorage.getItem('userToken');
    }

    setToken(token: string): void {
        localStorage.setItem('userToken', token);
        this.isAuthenticated.set(true);
    }

    logout(): void {
        localStorage.removeItem('userToken');
        this.isAuthenticated.set(false);
    }
}
