import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {UsuarioAdminDTO} from '../models/UsuarioAdminDTO';
import {Page} from '../models/Page';

@Injectable({
  providedIn: 'root'
})
export class RecetaService {
  private apiUrl = '/api/receta';
  constructor( private http: HttpClient ) { }

  /**
   * Obtiene la lista de recetas paginadas desde el backend.
   * @param page Número de página (1-indexed)
   * @param size Tamaño de página
   * @param searchTerm Término de búsqueda
   * @param showingActivos Indica si se deben mostrar solo los activos
   * @returns Observable que emite un objeto con los datos de las recetas, total de elementos y total de páginas
   */
  getRecetas(page: number, size: number, searchTerm: string, showingActivos: boolean): Observable<{ data: UsuarioAdminDTO[], totalItems: number , totalPages: number}> {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', size.toString())
      .set('searchTerm', searchTerm)
      .set('showingActivos', showingActivos.toString());
    return this.http.get<Page<UsuarioAdminDTO>>(`${this.apiUrl}/admin/listar`, { params })
      .pipe(
        map(springPage => {
          if (!springPage || typeof springPage.totalElements !== 'number' || !Array.isArray(springPage.content || typeof springPage.totalPages !== 'number')) {
            console.error('Respuesta inesperada del backend para ingredientes paginados:', springPage);
            return { data: [], totalItems: 0 , totalPages: 0}; // Fallback
          }
          return {
            data: springPage.content, // El array de IngredienteAdminDTO
            totalItems: springPage.totalElements, // El número total de elementos
            totalPages: springPage.totalPages
          };
        })
      );
  }
  /**
   * actualiza una nueva receta.
   * @param recetaData Datos de la receta a crear.
   * @returns Observable que emite la receta actualiza.
   */
  actualizarReceta(id: number, ingredienteData: any): Observable<any> {
    ingredienteData.id = id;
    return this.http.put<any>(`${this.apiUrl}/admin/actualizar`, ingredienteData);
  }
  /**
   * oculta una nueva receta.
   * @param recetaData Datos de la receta a crear.
   * @returns Observable que emite la receta oculta.
   */
  ocultarReceta(id: number): Observable<any> {
    return this.http.put<void>(`${this.apiUrl}/admin/desactivar`, id);
  }
}
