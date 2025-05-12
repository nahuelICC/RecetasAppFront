import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlergenoService {
  private apiUrl = '/api/alergeno';
  constructor(private http: HttpClient) {
  }
  getAlergenos(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/listar`);
  }
}
