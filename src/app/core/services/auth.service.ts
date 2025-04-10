import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';

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
   * Guardar token en localStorage
   * @param token
   */
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.loggedKey, 'true');
    this.isLoggedInSubject.next(true);
  }

  /**
   * Obtener token de localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Borrar token de localStorage
   */
  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.loggedKey);
    this.isLoggedInSubject.next(false);
  }


  /**
   * Cerrar sesión
   */
  logout(): void {
    this.clearToken();
    this.router.navigate(['/login']);
  }

  /**
   * Comprobar si el usuario está logueado
   */
  isLogged(): boolean {
    return localStorage.getItem(this.loggedKey) === 'true';
  }

  /**
   * Comprobar si el usuario es administrador
   */
  isAdmin(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.roles && payload.roles.includes('ROLE_ADMIN');
  }
}
