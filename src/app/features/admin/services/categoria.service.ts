import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CategoriaNoMedidaDTO} from '../models/CategoriaNoMedidaDTO';

/**
 * Servicio para manejar las categorías de los ingredientes en el panel de administración
 */
@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = '/api/categoria';
  constructor(private http: HttpClient) {

  }
  getCategorias(): Observable<CategoriaNoMedidaDTO[]> {
    return this.http.get<any>(`${this.apiUrl}/admin/listar`);
  }
}
