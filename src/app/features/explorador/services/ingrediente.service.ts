import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class IngredienteService {
  private apiUrl = '/api/ingrediente';
  constructor(private http: HttpClient) { }

  getIngredientes(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/listarBuscador`);
  }
}
