import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {RecetasExploradorFiltroDTO} from '../models/RecetasExploradorFiltroDTO';

@Injectable({
  providedIn: 'root'
})
export class RecetaService {

  private apiUrl = '/api/receta';
  constructor(private http: HttpClient) { }

  getRecetasFiltro(filtro: RecetasExploradorFiltroDTO): Observable<any[]> {
    return this.http.post<any>(`${this.apiUrl}/filtro`, filtro);
  }

  getNumRecetas(filtro: RecetasExploradorFiltroDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/filtro/counter`, filtro);
  }
}
