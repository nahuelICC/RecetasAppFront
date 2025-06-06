import {HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {RecetaInicioDTO} from '../models/RecetaInicioDTO';

@Injectable({
  providedIn: 'root'
})
export class InicioService {

  private apiUrl = 'api/receta';
  private listaCompraUrl = 'api/listaCompra';// URL base del backend

  constructor(private http: HttpClient) {}

  getTop10RecetasByCookerId(): Observable<RecetaInicioDTO[]> {
    return this.http.get<RecetaInicioDTO[]>(`${this.apiUrl}/recetasInicio`);
  }
  getRecetasSiguiendo(): Observable<RecetaInicioDTO[]> {
    return this.http.get<RecetaInicioDTO[]>(`${this.apiUrl}/recetasSiguiendo/`);
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
  agregarIngredientesALaListaCompra(idReceta: number): Observable<string> {
    return this.http.post<string>(`${this.listaCompraUrl}/agregar-ingredientes`, idReceta, {
      responseType: 'text' as 'json'
    });
  }

  getUltimasRecetas(): Observable<RecetaInicioDTO[]> {
    return this.http.get<RecetaInicioDTO[]>(`${this.apiUrl}/nuevas`);
  }

  getTop10RecetasFavoritas(): Observable<RecetaInicioDTO[]> {
    return this.http.get<RecetaInicioDTO[]>(`${this.apiUrl}/topFavoritas`);
  }



}
