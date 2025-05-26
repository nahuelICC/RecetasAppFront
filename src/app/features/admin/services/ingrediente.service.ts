import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {Page} from '../models/Page';
import {IngredienteListarDTO} from '../../explorador/models/IngredienteListarDTO';
import {IngredienteAdminDTO} from '../models/IngredienteAdminDTO';

@Injectable({
  providedIn: 'root'
})
export class IngredienteService {
  private apiUrl = '/api/ingrediente';
  constructor(private http: HttpClient) { }

  getIngredientes(page: number, size: number, searchTerm: string): Observable<{ data: IngredienteAdminDTO[], totalItems: number , totalPages: number}> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('searchTerm', searchTerm);
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
  createIngrediente(ingredienteData: any): Observable<IngredienteAdminDTO> {
    return this.http.post<IngredienteAdminDTO>(`${this.apiUrl}/admin/crear`, ingredienteData); // Ajusta endpoint
  }

  updateIngrediente(id: number, ingredienteData: any): Observable<IngredienteAdminDTO> {
    return this.http.put<IngredienteAdminDTO>(`${this.apiUrl}/admin/actualizar/${id}`, ingredienteData); // Ajusta endpoint
  }

  deleteIngrediente(id: number): Observable<void> { // Delete a menudo no devuelve contenido
    return this.http.delete<void>(`${this.apiUrl}/admin/eliminar/${id}`); // Ajusta endpoint
  }
}
