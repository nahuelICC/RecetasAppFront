import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormControl, ɵValue} from '@angular/forms';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CambioPasswordService {

  private apiUrl = 'https://cookersback.onrender.com/usuario';

  constructor(private http:HttpClient) { }

  /**
   * Endpoint que envia un correo con el token para cambiar la contraseña
   * @param email
   */
  solicitarCambioPassword(email: ɵValue<FormControl<string | null>> | undefined) {
    return this.http.post(`${this.apiUrl}/solicitaCambio`, { email }, { responseType: 'text' });
  }

  /**
   * Endpoint que valida el token para cambiar la contraseña
   * @param token
   */
  validaToken(token: string): Observable<{ valid: boolean }> {
    return this.http.get<{ valid: boolean }>(
      `${this.apiUrl}/validarToken/${encodeURIComponent(token)}`
    );
  }

  /**
   * Endpoint que cambia  la contraseña
   * @param token
   * @param password
   * @param confirmPassword
   */
  resetPassword(token: string, password: ɵValue<FormControl<string | null>> | undefined, confirmPassword: ɵValue<FormControl<string | null>> | undefined): Observable<any> {
    return this.http.post(`${this.apiUrl}/cambioContrasenyaToken`, { token, password, confirmPassword }, { responseType: 'text' });
  }

}
