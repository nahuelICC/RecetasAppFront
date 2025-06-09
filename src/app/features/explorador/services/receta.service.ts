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
  /**
   * Obtiene las recetas filtradas según los criterios proporcionados.
   * @param filtro - Objeto que contiene los criterios de filtrado.
   * @returns Observable que emite un array de recetas filtradas.
   */
  getRecetasFiltro(filtro: RecetasExploradorFiltroDTO): Observable<any[]> {
    return this.http.post<any>(`${this.apiUrl}/filtro`, filtro);
  }
  /**
   * Obtiene el número total de recetas que coinciden con los criterios de filtrado.
   * @param filtro - Objeto que contiene los criterios de filtrado.
   * @returns Observable que emite el número total de recetas.
   */
  getNumRecetas(filtro: RecetasExploradorFiltroDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/filtro/counter`, filtro);
  }
  /**
   * Obtiene las recetas populares.
   * @returns Observable que emite un array de recetas populares.
   */
  getIntereaccionesRecetasUsuario(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/interacciones`, {});
  }
  /**
   * Obtiene las recetas guardadas por el usuario.
   * @returns Observable que emite un array de recetas guardadas.
   */
  darMeGustaAReceta(recetaId: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/meGusta`, recetaId, { responseType: 'text' as 'json' });
  }
  /**
   * Verifica si una receta tiene "Me gusta" del usuario.
   * @param recetaId - ID de la receta a verificar.
   * @returns Observable que emite un booleano indicando si la receta tiene "Me gusta".
   */
  verificarMeGusta(recetaId: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/estado`, recetaId);
  }
  /**
   * Elimina el "Me gusta" de una receta.
   * @param recetaId - ID de la receta a eliminar el "Me gusta".
   * @returns Observable que emite un mensaje de confirmación.
   */
  eliminarMeGusta(recetaId: number): Observable<string> {
    return this.http.request<string>('DELETE', `${this.apiUrl}/meGusta`, {
      body: recetaId,
      responseType: 'text' as 'json'
    });
  }
  /**
   * Guarda una receta.
   * @param recetaId - ID de la receta a guardar.
   * @returns Observable que emite un mensaje de confirmación.
   */
  guardarReceta(recetaId: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/guardar`, recetaId, { responseType: 'text' as 'json' });
  }
  /**
   * Verifica si una receta está guardada por el usuario.
   * @param recetaId - ID de la receta a verificar.
   * @returns Observable que emite un booleano indicando si la receta está guardada.
   */
  verificarRecetaGuardada(recetaId: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/estadoGuardado`, recetaId);
  }
  /**
   * Elimina una receta guardada por el usuario.
   * @param recetaId - ID de la receta a eliminar de los guardados.
   * @returns Observable que emite un mensaje de confirmación.
   */
  eliminarRecetaGuardada(recetaId: number): Observable<string> {
    return this.http.request<string>('DELETE', `${this.apiUrl}/guardar`, {
      body: recetaId,
      responseType: 'text' as 'json'
    });
  }
}
