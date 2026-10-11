import { Service, signal } from '@angular/core';
import { authResponse } from '../model/response/authResponse';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { loginRequest } from '../model/request/loginRequest';
import { registerRequest } from '../model/request/registerRequest';
import { StorageService } from './storage';
import { environment } from '../environments/environment';
@Service()
export class Auth {
    private apiUrl = `${environment.url}/auth`
    private storageService = inject(StorageService);

    private isAuthenticated = signal<boolean>(this.hasToken());
    isAuthenticated$ = this.isAuthenticated.asReadonly();

    http = inject(HttpClient);
    login(user: loginRequest) : Observable<authResponse> {
            return this.http.post<authResponse>(`${this.apiUrl}/login`,user);
    }

    register(user: registerRequest) : Observable<authResponse> {
        return this.http.post<authResponse>(`${this.apiUrl}/register`,user);
    }

    private hasToken(): boolean {
        return !!this.storageService.getItem('userToken');
    }

    public setToken(token: string): void {
        this.storageService.setItem('userToken', token);
        this.isAuthenticated.set(true);
    }

    logout(): void {
        this.storageService.removeItem('userToken');
        this.isAuthenticated.set(false);
    }
}
