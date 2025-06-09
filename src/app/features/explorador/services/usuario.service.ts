import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {UsuarioExploradorFiltroDTO} from '../models/UsuarioExploradorFiltroDTO';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = '/api/usuario';
  constructor(private http: HttpClient) { }
  /**
   * Obtiene los usuarios filtrados según los criterios proporcionados.
   * @param filtro - Objeto que contiene los criterios de filtrado.
   * @returns Observable que emite un array de usuarios filtrados.
   */
  getUsuariosFiltro(filtro: UsuarioExploradorFiltroDTO): Observable<any[]> {
    return this.http.post<any>(`${this.apiUrl}/filtro`, filtro);
  }
  /**
   * Obtiene el número total de usuarios que coinciden con los criterios de filtrado.
   * @param filtro - Objeto que contiene los criterios de filtrado.
   * @returns Observable que emite el número total de usuarios.
   */
  getNumUsuarios(filtro: UsuarioExploradorFiltroDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/filtro/counter`, filtro);
  }
}
