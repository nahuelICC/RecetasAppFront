import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {RecetasExploradorFiltroDTO} from '../models/RecetasExploradorFiltroDTO';

@Injectable({
  providedIn: 'root'
})
export class RecetaService {

  private apiUrl = '/api/receta';
  constructor(private http: HttpClient) { }

  getRecetasFiltro(filtro: RecetasExploradorFiltroDTO): Observable<any[]> {
    return this.http.post<any>(`${this.apiUrl}/filtro`, filtro);
  }

  getNumRecetas(filtro: RecetasExploradorFiltroDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/filtro/counter`, filtro);
  }

  getIntereaccionesRecetasUsuario(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/interacciones`, {});
  }

  darMeGustaAReceta(recetaId: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/meGusta`, recetaId, { responseType: 'text' as 'json' });
  }

  verificarMeGusta(recetaId: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/estado`, recetaId);
  }
  eliminarMeGusta(recetaId: number): Observable<string> {
    return this.http.request<string>('DELETE', `${this.apiUrl}/meGusta`, {
      body: recetaId,
      responseType: 'text' as 'json'
    });
  }

  guardarReceta(recetaId: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/guardar`, recetaId, { responseType: 'text' as 'json' });
  }

  verificarRecetaGuardada(recetaId: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/estadoGuardado`, recetaId);
  }

  eliminarRecetaGuardada(recetaId: number): Observable<string> {
    return this.http.request<string>('DELETE', `${this.apiUrl}/guardar`, {
      body: recetaId,
      responseType: 'text' as 'json'
    });
  }
}
