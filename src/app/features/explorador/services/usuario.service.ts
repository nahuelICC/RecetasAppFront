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

  getUsuariosFiltro(filtro: UsuarioExploradorFiltroDTO): Observable<any[]> {
    return this.http.post<any>(`${this.apiUrl}/filtro`, filtro);
  }

  getNumUsuarios(filtro: UsuarioExploradorFiltroDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/filtro/counter`, filtro);
  }
}
