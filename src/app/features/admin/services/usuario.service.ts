import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {IngredienteAdminDTO} from '../models/IngredienteAdminDTO';
import {Page} from '../models/Page';
import {UsuarioAdminDTO} from '../models/UsuarioAdminDTO';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = '/api/usuario';
  constructor( private http: HttpClient ) { }

  getUsuarios(page: number, size: number, searchTerm: string, showingActivos: boolean): Observable<{ data: UsuarioAdminDTO[], totalItems: number , totalPages: number}> {
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
  actualizarUsuario(id: number, ingredienteData: any): Observable<any> {
    ingredienteData.id = id;
    return this.http.put<any>(`${this.apiUrl}/admin/actualizar`, ingredienteData);
  }

  ocultarUsuario(id: number): Observable<any> {
    return this.http.put<void>(`${this.apiUrl}/admin/desactivar`, id);
  }
}
