import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AlergenoNoImgDTO} from '../models/AlergenoNoImgDTO';

/**
 * Servicio para manejar los alérgenos de los ingredientes en el panel de administración.
 */
@Injectable({
  providedIn: 'root'
})
export class AlergenoService {
  private apiUrl = 'https://cookersback.onrender.com/alergeno';
  constructor(private http: HttpClient) {
  }

  /**
   * Obtiene la lista de alérgenos desde el backend.
   */
  getAlergenos(): Observable<AlergenoNoImgDTO[]> {
  return this.http.get<any>(`${this.apiUrl}/admin/listar`);

  }
}
