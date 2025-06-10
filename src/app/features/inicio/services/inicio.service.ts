import {HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {RecetaInicioDTO} from '../models/RecetaInicioDTO';

@Injectable({
  providedIn: 'root'
})
export class InicioService {

  private apiUrl = 'https://cookersback.onrender.com/receta';
  private listaCompraUrl = 'https://cookersback.onrender.com/listaCompra';// URL base del backend

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el top 10 de recetas para un usuario.
   */
  getTop10RecetasByCookerId(): Observable<RecetaInicioDTO[]> {
    return this.http.get<RecetaInicioDTO[]>(`${this.apiUrl}/recetasInicio`);
  }

  /**
   * Obtiene las recetas de usuarios que el usuario está siguiendo.
   * @returns Observable con un array de RecetaInicioDTO
   */
  getRecetasSiguiendo(): Observable<RecetaInicioDTO[]> {
    return this.http.get<RecetaInicioDTO[]>(`${this.apiUrl}/recetasSiguiendo/`);
  }

  /**
   * Da "me gusta" a una receta.
   */
  darMeGustaAReceta(recetaId: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/meGusta`, recetaId, { responseType: 'text' as 'json' });
  }

  /**
   * Verifica si una receta tiene "me gusta" del usuario.
   */
  verificarMeGusta(recetaId: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/estado`, recetaId);
  }

  /**
   * Elimina el "me gusta" de una receta.
   */
  eliminarMeGusta(recetaId: number): Observable<string> {
    return this.http.request<string>('DELETE', `${this.apiUrl}/meGusta`, {
      body: recetaId,
      responseType: 'text' as 'json'
    });
  }

  /**
   * Guarda una receta.
   * @param recetaId ID de la receta a guardar
   * @returns Observable con un mensaje de éxito o error
   */
  guardarReceta(recetaId: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/guardar`, recetaId, { responseType: 'text' as 'json' });
  }

  /**
   * Verifica si una receta está guardada por el usuario.
   * @param recetaId ID de la receta a verificar
   * @returns Observable con un booleano indicando si la receta está guardada
   */
  verificarRecetaGuardada(recetaId: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/estadoGuardado`, recetaId);
  }

  /**
   * Elimina una receta guardada.
   * @param recetaId ID de la receta a eliminar
   * @returns Observable con un mensaje de éxito o error
   */
  eliminarRecetaGuardada(recetaId: number): Observable<string> {
    return this.http.request<string>('DELETE', `${this.apiUrl}/guardar`, {
      body: recetaId,
      responseType: 'text' as 'json'
    });
  }

  /**
   * Agrega los ingredientes de una receta a la lista de compra.
   * @param idReceta ID de la receta cuyos ingredientes se agregarán
   * @returns Observable con un mensaje de éxito o error
   */
  agregarIngredientesALaListaCompra(idReceta: number): Observable<string> {
    return this.http.post<string>(`${this.listaCompraUrl}/agregar-ingredientes`, idReceta, {
      responseType: 'text' as 'json'
    });
  }

  /**
   * Obtiene las últimas recetas.
   * @returns Observable con un array de RecetaInicioDTO
   */
  getUltimasRecetas(): Observable<RecetaInicioDTO[]> {
    return this.http.get<RecetaInicioDTO[]>(`${this.apiUrl}/nuevas`);
  }

  /**
   * Obtiene las recetas más populares.
   * @returns Observable con un array de RecetaInicioDTO
   */
  getTop10RecetasFavoritas(): Observable<RecetaInicioDTO[]> {
    return this.http.get<RecetaInicioDTO[]>(`${this.apiUrl}/topFavoritas`);
  }



}
