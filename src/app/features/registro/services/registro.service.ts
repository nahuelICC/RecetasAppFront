import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {

  private apiUrl = '/api/alergeno';
  private apiIngredientesUrl = '/api/ingrediente';
  private apiUsuarioUrl = '/api/usuario';


  constructor(private http: HttpClient) {
  }

  /**
   * Obtiene la lista de alérgenos para mostrarlos en el registro
   */
  getAlergenosImagen(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/listarMostrar`);
  }

  /**
   * Obtiene la lista de ingredientes para el buscador
   */
  getIngredientesBuscador(): Observable<any> {
    return this.http.get<any>(`${this.apiIngredientesUrl}/listarBuscador`);
  }

  /**
   * Registra un nuevo usuario
   * @param formData Datos del formulario de registro
   */
  registrarUsuario(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUsuarioUrl}/registro`, formData);
  }

  /**
   * Activa la cuenta de usuario mediante un token
   * @param token Token de activación
   */
  activarCuenta(token: string): Observable<any> {
    return this.http.put<any>(`${this.apiUsuarioUrl}/activar?token=${token}`, {});
  }
}
