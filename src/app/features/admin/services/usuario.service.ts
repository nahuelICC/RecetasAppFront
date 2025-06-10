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
  private apiUrl = 'https://cookersback.onrender.com/usuario';
  constructor( private http: HttpClient ) { }
  /**
   * Obtiene la lista de usuarios paginados desde el backend.
   * @param page - Número de página (1-indexed).
   * @param size - Tamaño de página.
   * @param searchTerm - Término de búsqueda para filtrar usuarios.
   * @param showingActivos - Booleano para mostrar solo usuarios activos.
   * @returns Observable que emite un objeto con los datos de los usuarios, total de elementos y total de páginas.
   */
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
  /**
   * Crea un nuevo usuario.
   * @param usuarioData - Datos del usuario a crear.
   * @returns Observable que emite el usuario creado.
   */
  crearUsuario(usuarioData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/crear`, usuarioData);
  }
  /**
   * Actualiza un usuario por su ID.
   * @param id - ID del usuario.
   * @param usuarioData - Datos del usuario a actualizar.
   * @returns Observable que emite el usuario actualizado.
   */
  actualizarUsuario(id: number, usuarioData: any): Observable<any> {
    usuarioData.id = id;
    return this.http.put<any>(`${this.apiUrl}/admin/actualizar`, usuarioData);
  }
  /**
   * Oculta un usuario por su ID.
   * @param id - ID del usuario.
   * @returns Observable que emite el resultado de la operación.
   */
  ocultarUsuario(id: number): Observable<any> {
    return this.http.put<void>(`${this.apiUrl}/admin/desactivar`, id);
  }
}
