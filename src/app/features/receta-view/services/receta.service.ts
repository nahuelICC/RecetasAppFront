import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RecetaViewResponse } from '../models/RecetaViewResponse';
import { PasoResponse } from '../models/PasoResponse';

@Injectable({
  providedIn: 'root'
})
export class RecetaService {


  private apiUrl = 'https://cookersback.onrender.com/receta';
  private apiIngredientesUrl = 'https://cookersback.onrender.com/ingrediente';
  private apiUsuarioUrl = 'https://cookersback.onrender.com/usuario';


  constructor(private http: HttpClient) {
  }

  /**
   * Obtiene la información de una receta por su ID.
   * @param id
   */
  getInfoReceta(id: string): Observable<RecetaViewResponse> {
    return this.http.get<RecetaViewResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene los pasos de una receta por su ID.
   * @param id
   */
  getPasosReceta(id: string): Observable<PasoResponse[]> {
    return this.http.get<PasoResponse[]>(`${this.apiUrl}/pasos/${id}`);
  }

}
