import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = 'https://cookersback.onrender.com/auth';

  constructor(private http:HttpClient) { }

  /**
   * Método para hacer login
   * @param credentials - Objeto con las credenciales del usuario
   * @returns Observable<any> - Observable con la respuesta del servidor
   */
  login(credentials: { usuario: string; contrasenya: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials);
  }

}
