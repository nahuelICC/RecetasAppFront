import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RecetaViewResponse } from '../models/RecetaViewResponse';
import { PasoResponse } from '../models/PasoResponse';

@Injectable({
  providedIn: 'root'
})
export class RecetaService {


  private apiUrl = '/api/receta';
  private apiIngredientesUrl = '/api/ingrediente';
  private apiUsuarioUrl = '/api/usuario';


  constructor(private http: HttpClient) {
  }

  getInfoReceta(id: string): Observable<RecetaViewResponse> {
    return this.http.get<RecetaViewResponse>(`${this.apiUrl}/${id}`);
  }

  getPasosReceta(id: string): Observable<PasoResponse[]> {
    return this.http.get<PasoResponse[]>(`${this.apiUrl}/pasos/${id}`);
  }

}