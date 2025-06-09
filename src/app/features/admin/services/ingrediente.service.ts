import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {Page} from '../models/Page';
import {IngredienteListarDTO} from '../../explorador/models/IngredienteListarDTO';
import {IngredienteAdminDTO} from '../models/IngredienteAdminDTO';

/**
 * Servicio para manejar los ingredientes en el panel de administración
 */
@Injectable({
  providedIn: 'root'
})
export class IngredienteService {
  private apiUrl = '/api/ingrediente';
  constructor(private http: HttpClient) { }
  /**
   * Obtiene la lista de ingredientes desde el backend.
   * @returns Observable que emite un array de ingredientes.
   */
  getIngredientes(page: number, size: number, searchTerm: string, showingActivos: boolean): Observable<{ data: IngredienteAdminDTO[], totalItems: number , totalPages: number}> {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', size.toString())
      .set('searchTerm', searchTerm)
      .set('showingActivos', showingActivos.toString());
    return this.http.get<Page<IngredienteAdminDTO>>(`${this.apiUrl}/admin/listar`, { params })
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
   * crea un ingrediente.
   * @param ingredienteData
   * @returns Observable que emite el ingrediente creado.
   */
  crearIngrediente(ingredienteData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/crear`, ingredienteData);
  }
  /**
   * actualiza un ingrediente por su ID.
   * @param id ID del ingrediente.
   * @param ingredienteData Datos del ingrediente a actualizar.
   * @returns Observable que emite el ingrediente actualizdo.
   */
  actualizarIngrediente(id: number, ingredienteData: any): Observable<any> {
    ingredienteData.id = id;
    return this.http.put<any>(`${this.apiUrl}/admin/actualizar`, ingredienteData);
  }
  /**
   * oculta un ingrediente por su ID.
   * @param id ID del ingrediente.
   * @returns Observable que emite el ingrediente ocultado.
   */
  ocultarIngrediente(id: number): Observable<any> {
    return this.http.put<void>(`${this.apiUrl}/admin/desactivar`, id);
  }
}
