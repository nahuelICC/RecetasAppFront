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

  getAlergenosImagen(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/listarMostrar`);
  }

  getIngredientesBuscador(): Observable<any> {
    return this.http.get<any>(`${this.apiIngredientesUrl}/listarBuscador`);
  }

  registrarUsuario(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUsuarioUrl}/registro`, formData);
  }
}
