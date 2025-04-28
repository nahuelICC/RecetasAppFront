import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'token';
  private loggedKey = 'logged';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLogged());

  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.loggedKey, 'true');
    this.isLoggedInSubject.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      // Extraer el payload del token
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

      // Acceder al username según la estructura del token
      if (payload.tokenDataDTO && payload.tokenDataDTO.username) {
        return payload.tokenDataDTO.username;
      }
      return null;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.tokenDataDTO?.idUsuario || null;
    } catch (e) {
      console.error('Error getting user ID from token:', e);
      return null;
    }
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.tokenDataDTO?.rol || null;
    } catch (e) {
      console.error('Error getting user role from token:', e);
      return null;
    }
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.loggedKey);
    this.isLoggedInSubject.next(false);
  }

  logout(): void {
    this.clearToken();
    this.router.navigate(['/login']);
  }

  isLogged(): boolean {
    return localStorage.getItem(this.loggedKey) === 'true';
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN'; // Ajusta según tus roles
  }
}
