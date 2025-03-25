import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {RecetaInicioDTO} from '../../models/RecetaInicioDTO';

@Injectable({
  providedIn: 'root'
})
export class InicioService {

  private apiUrl = 'api/receta'; // URL base del backend

  constructor(private http: HttpClient) {}

  getTop10RecetasByCookerId(cookerId: number): Observable<RecetaInicioDTO[]> {
    return this.http.get<RecetaInicioDTO[]>(`${this.apiUrl}/recetasInicio/${cookerId}`);
  }


}
