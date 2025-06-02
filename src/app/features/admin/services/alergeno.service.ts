import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AlergenoNoImgDTO} from '../models/AlergenoNoImgDTO';

@Injectable({
  providedIn: 'root'
})
export class AlergenoService {
  private apiUrl = '/api/alergeno';
  constructor(private http: HttpClient) {
  }
  getAlergenos(): Observable<AlergenoNoImgDTO[]> {
  return this.http.get<any>(`${this.apiUrl}/admin/listar`);

  }
}
