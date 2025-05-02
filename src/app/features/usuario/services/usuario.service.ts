import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = '/api/cooker';

  constructor(private http: HttpClient) { }

  getPerfil() {
    return this.http.get<any>(`${this.apiUrl}/perfil`);
  }

  getPerfilId(id: string) {
    return this.http.get<any>(`${this.apiUrl}/perfil/${id}`);
  }
}
