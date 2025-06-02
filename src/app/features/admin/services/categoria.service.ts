import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CategoriaNoMedidaDTO} from '../models/CategoriaNoMedidaDTO';

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
