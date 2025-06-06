import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

/**
 * Servicio de autenticación para manejar el inicio de sesión, token y estado del usuario.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'token';
  private loggedKey = 'logged';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLogged());

  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Endpoint que establece el token de autenticación y actualiza el estado de inicio de sesión.
   * @param token
   */
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.loggedKey, 'true');
    this.isLoggedInSubject.next(true);
  }

  /**
   * Endpoint que obtiene el token.
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Endpoint que obtiene el nombre de usuario del token.
   */
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

  /**
   * Endpoint que obtiene el ID del usuario del token.
   */
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

  /**
   * Endpoint que obtiene el rol del usuario del token.
   */
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

  /**
   * Endpoint que limpia el token y actualiza el estado de inicio de sesión.
   */
  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.loggedKey);
    this.isLoggedInSubject.next(false);
  }

  /**
   * Endpoint que cierra la sesión del usuario, limpia el token y redirige al login.
   */
  logout(): void {
    this.clearToken();
    this.router.navigate(['/login']);
  }

  /**
   * Endpoint que verifica si el usuario está logueado.
   */
  isLogged(): boolean {
    return localStorage.getItem(this.loggedKey) === 'true';
  }

  /**
   * Endpoint que verifica si el usuario es administrador.
   */
  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }


}
